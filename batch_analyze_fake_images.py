import os
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import numpy as np
import json
import csv
from datetime import datetime
import glob

def load_model():
    """Load the fixed model"""
    model_path = 'model_fixed.h5'
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return None

    try:
        print(f"📥 Loading model from {model_path}...")
        model = keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully!")
        return model
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return None

def prepare_image(image_path, target_size=(128, 128)):
    """Prepare image for prediction (same as Flask app)"""
    try:
        img = Image.open(image_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img = img.resize(target_size)
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        return img_array
    except Exception as e:
        print(f"❌ Error preparing image {image_path}: {e}")
        return None

def analyze_image(model, image_path):
    """Analyze a single image and return results"""
    processed_img = prepare_image(image_path)
    if processed_img is None:
        return None

    try:
        prediction = model.predict(processed_img, verbose=0)
        score = float(prediction[0][0])
        result = "FAKE" if score > 0.5 else "REAL"
        confidence = (score if score > 0.5 else (1 - score)) * 100

        return {
            'filename': os.path.basename(image_path),
            'filepath': image_path,
            'prediction': result,
            'confidence_score': score,
            'confidence_percent': f"{confidence:.2f}%",
            'is_correct': result == "FAKE"  # Since these are fake images
        }
    except Exception as e:
        print(f"❌ Error analyzing {image_path}: {e}")
        return None

def scan_fake_folder():
    """Scan the Fake folder for images"""
    fake_folder = 'Fake'

    if not os.path.exists(fake_folder):
        print(f"❌ Fake folder not found: {fake_folder}")
        print("Please create the 'Fake' folder and add your 73 fake images.")
        return []

    # Find all image files
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.webp']
    image_files = []

    for ext in image_extensions:
        pattern = os.path.join(fake_folder, ext)
        image_files.extend(glob.glob(pattern))

    image_files.sort()  # Sort for consistent ordering

    print(f"📁 Found {len(image_files)} images in {fake_folder}/")
    return image_files

def generate_reports(results, total_images):
    """Generate comprehensive reports"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Calculate statistics
    correct_detections = sum(1 for r in results if r['is_correct'])
    accuracy = (correct_detections / total_images) * 100 if total_images > 0 else 0

    fake_predictions = sum(1 for r in results if r['prediction'] == "FAKE")
    real_predictions = sum(1 for r in results if r['prediction'] == "REAL")

    # Summary report
    summary = {
        'analysis_timestamp': datetime.now().isoformat(),
        'total_images_analyzed': total_images,
        'correctly_detected_as_fake': correct_detections,
        'accuracy_percentage': f"{accuracy:.2f}%",
        'predicted_as_fake': fake_predictions,
        'predicted_as_real': real_predictions,
        'false_negatives': real_predictions,  # Fake images predicted as real
        'results': results
    }

    # Save JSON report
    json_filename = f"fake_images_analysis_{timestamp}.json"
    with open(json_filename, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"💾 JSON report saved: {json_filename}")

    # Save CSV report
    csv_filename = f"fake_images_analysis_{timestamp}.csv"
    with open(csv_filename, 'w', newline='') as f:
        fieldnames = ['filename', 'prediction', 'confidence_percent', 'is_correct']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for result in results:
            writer.writerow({
                'filename': result['filename'],
                'prediction': result['prediction'],
                'confidence_percent': result['confidence_percent'],
                'is_correct': 'YES' if result['is_correct'] else 'NO'
            })
    print(f"💾 CSV report saved: {csv_filename}")

    return summary

def main():
    """Main batch analysis function"""
    print("🤖 REBEL AI - Fake Images Batch Analysis")
    print("=" * 50)

    # Load model
    model = load_model()
    if model is None:
        return

    # Scan for images
    image_files = scan_fake_folder()
    if not image_files:
        return

    total_images = len(image_files)
    print(f"🎯 Analyzing {total_images} fake images...\n")

    # Analyze each image
    results = []
    processed_count = 0

    for image_path in image_files:
        result = analyze_image(model, image_path)
        if result:
            results.append(result)
            processed_count += 1

            # Progress indicator
            status = "✅" if result['is_correct'] else "❌"
            print(f"{status} {result['filename']}: {result['prediction']} ({result['confidence_percent']})")

    print(f"\n📊 Analysis Complete!")
    print(f"Processed: {processed_count}/{total_images} images")

    # Generate reports
    if results:
        summary = generate_reports(results, processed_count)

        # Display summary
        print("\n" + "=" * 50)
        print("📈 SUMMARY REPORT")
        print("=" * 50)
        print(f"Total Images Analyzed: {summary['total_images_analyzed']}")
        print(f"Correctly Detected as Fake: {summary['correctly_detected_as_fake']}")
        print(f"Model Accuracy: {summary['accuracy_percentage']}")
        print(f"Predicted as Fake: {summary['predicted_as_fake']}")
        print(f"Predicted as Real (False Negatives): {summary['predicted_as_real']}")

        if summary['accuracy_percentage'] == "100.00%":
            print("🎉 PERFECT! All fake images detected correctly!")
        elif float(summary['accuracy_percentage'].replace('%', '')) > 90:
            print("🏆 EXCELLENT! Very high detection accuracy!")
        elif float(summary['accuracy_percentage'].replace('%', '')) > 75:
            print("👍 GOOD! Decent detection performance!")
        else:
            print("⚠️  Needs improvement - model may require retraining!")

    print("\n✅ Batch analysis complete! Check the generated report files.")

if __name__ == "__main__":
    main()
