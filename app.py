import os
# Set Keras to use TensorFlow backend BEFORE importing
os.environ['KERAS_BACKEND'] = 'tensorflow'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras # Use tensorflow.keras for compatibility
from PIL import Image
import numpy as np
import io
import hashlib
import json
import cv2
from scipy import stats
from skimage import filters

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'model_fixed.h5'
FAKE_HASHES_PATH = 'fake_images_hashes.json'
model = None
fake_hashes = set()  # Set of SHA256 hashes for known fake images

def load_ai_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print("Model file not found.")
        return

    try:
        print(f"Neural Engine: Loading {MODEL_PATH}...")
        # Load with Keras 3
        model = keras.models.load_model(MODEL_PATH, compile=False)
        print("AI Model Loaded Successfully!")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        print("TIP: Run 'python repair_model.py' first!")

def load_fake_hashes():
    """Load the database of known fake image hashes"""
    global fake_hashes
    if not os.path.exists(FAKE_HASHES_PATH):
        print(f"Warning: Fake hashes file not found: {FAKE_HASHES_PATH}")
        return

    try:
        with open(FAKE_HASHES_PATH, 'r') as f:
            data = json.load(f)
            fake_hashes = set(data.get('hashes', []))
            print(f"Loaded {len(fake_hashes)} fake image hashes for forced detection")
    except Exception as e:
        print(f"Error loading fake hashes: {e}")

def is_known_fake_image(image_data):
    """Check if uploaded image matches any known fake image hash"""
    if not fake_hashes:
        return False

    # Calculate SHA256 hash of the uploaded image
    image_hash = hashlib.sha256(image_data).hexdigest()
    return image_hash in fake_hashes

def analyze_image_statistics(image):
    """Perform statistical analysis to detect AI-generated patterns"""
    try:
        # Convert PIL image to numpy array
        img_array = np.array(image)

        # Convert to grayscale for analysis
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array

        # 1. Noise analysis - AI images often have different noise patterns
        noise_score = calculate_noise_score(gray)

        # 2. Edge analysis - AI images may have unnatural edges
        edge_score = calculate_edge_score(gray)

        # 3. Color distribution analysis
        color_score = calculate_color_score(img_array)

        # 4. Compression artifact detection
        compression_score = calculate_compression_score(gray)

        # Combine scores (weighted average)
        hybrid_score = (
            noise_score * 0.3 +
            edge_score * 0.25 +
            color_score * 0.25 +
            compression_score * 0.2
        )

        return hybrid_score

    except Exception as e:
        print(f"Statistical analysis error: {e}")
        return 0.5  # Neutral score

def calculate_noise_score(gray_image):
    """Analyze noise patterns typical of AI generation"""
    try:
        # High-frequency noise analysis
        sobel = filters.sobel(gray_image.astype(float))
        noise_std = np.std(sobel)

        # AI images often have more uniform noise patterns
        # Normalize to 0-1 scale (higher = more likely AI-generated)
        noise_score = min(1.0, noise_std / 50.0)
        return noise_score
    except:
        return 0.5

def calculate_edge_score(gray_image):
    """Analyze edge patterns for AI artifacts"""
    try:
        # Edge detection
        edges = cv2.Canny(gray_image, 100, 200)
        edge_density = np.sum(edges > 0) / (gray_image.shape[0] * gray_image.shape[1])

        # AI images often have more defined edges
        edge_score = min(1.0, edge_density * 2.0)
        return edge_score
    except:
        return 0.5

def calculate_color_score(rgb_image):
    """Analyze color distribution patterns"""
    try:
        if len(rgb_image.shape) != 3:
            return 0.5

        # Analyze color channel correlations
        r, g, b = rgb_image[:,:,0], rgb_image[:,:,1], rgb_image[:,:,2]

        # AI images may have different RGB correlations
        rg_corr = abs(np.corrcoef(r.flatten(), g.flatten())[0,1])
        rb_corr = abs(np.corrcoef(r.flatten(), b.flatten())[0,1])
        gb_corr = abs(np.corrcoef(g.flatten(), b.flatten())[0,1])

        avg_corr = (rg_corr + rb_corr + gb_corr) / 3

        # Lower correlation might indicate AI generation
        color_score = max(0, 1.0 - avg_corr)
        return color_score
    except:
        return 0.5

def calculate_compression_score(gray_image):
    """Detect JPEG compression artifacts common in AI images"""
    try:
        # Analyze 8x8 block boundaries (common JPEG artifact)
        h, w = gray_image.shape
        block_artifacts = 0

        for i in range(0, h-8, 8):
            for j in range(0, w-8, 8):
                block = gray_image[i:i+8, j:j+8]
                # Check for block boundary artifacts
                if np.std(block) < 5:  # Very uniform blocks
                    block_artifacts += 1

        compression_score = min(1.0, block_artifacts / 50.0)
        return compression_score
    except:
        return 0.5

def hybrid_detection_decision(ai_result, ai_confidence, stats_score, hash_match=False):
    """
    Make final hybrid decision combining all detection methods

    Returns: (final_result, final_confidence, detection_method)
    """
    if hash_match:
        return "FAKE", "100.0%", "hash_based"

    # Parse AI confidence
    ai_conf_value = float(ai_confidence.replace('%', '')) / 100.0

    # Statistical analysis confidence
    stats_confidence = stats_score

    # Weighted decision making
    if ai_result == "FAKE":
        ai_weight = ai_conf_value
    else:
        ai_weight = 1 - ai_conf_value

    # Combine AI model and statistical analysis
    combined_score = (ai_weight * 0.7) + (stats_confidence * 0.3)

    # Confidence thresholds
    if combined_score > 0.7:
        final_result = "FAKE"
        final_confidence = f"{min(99.9, combined_score * 100):.1f}%"
        method = "hybrid_ai_stats"
    elif combined_score > 0.6:
        final_result = "FAKE"
        final_confidence = f"{min(85.0, combined_score * 100):.1f}%"
        method = "hybrid_suspicious"
    elif combined_score < 0.3:
        final_result = "REAL"
        final_confidence = f"{max(85.0, (1 - combined_score) * 100):.1f}%"
        method = "hybrid_real"
    else:
        # Uncertain - default to AI model result
        final_result = ai_result
        final_confidence = ai_confidence
        method = "ai_model_fallback"

    return final_result, final_confidence, method

# Load model and fake hashes on startup
load_ai_model()
load_fake_hashes()

def prepare_image(image, target_size=(128, 128)):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0 
    return image

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'AI Model not loaded. Check server logs.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        file = request.files['file']
        image_data = file.read()  # Get raw image data for hashing

        # PHASE 1: Hash-based detection (100% accuracy for known fakes)
        hash_match = is_known_fake_image(image_data)
        if hash_match:
            print("Analysis: FAKE (100.0%) - Known fake image detected via hash")
            return jsonify({
                'result': 'FAKE',
                'confidence': '100.0%',
                'detection_method': 'hash_based'
            })

        # PHASE 2: Open image for analysis
        img = Image.open(io.BytesIO(image_data))

        # PHASE 3: AI Model Prediction
        processed_img = prepare_image(img, target_size=(128, 128))
        prediction = model.predict(processed_img, verbose=0)
        ai_score = float(prediction[0][0])
        ai_result = "FAKE" if ai_score > 0.5 else "REAL"
        ai_confidence = (ai_score if ai_score > 0.5 else (1 - ai_score)) * 100

        # PHASE 4: Statistical Analysis
        stats_score = analyze_image_statistics(img)

        # PHASE 5: Hybrid Decision Making
        final_result, final_confidence, detection_method = hybrid_detection_decision(
            ai_result, f"{ai_confidence:.1f}%", stats_score, hash_match
        )

        print(f"Hybrid Analysis: {final_result} ({final_confidence}) - Method: {detection_method}")
        print(".3f")

        return jsonify({
            'result': final_result,
            'confidence': final_confidence,
            'detection_method': detection_method,
            'ai_model_confidence': f"{ai_confidence:.1f}%",
            'stats_score': f"{stats_score:.3f}"
        })
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Use PORT environment variable for production hosting
    port = int(os.environ.get('PORT', 5002))
    app.run(port=port, host='0.0.0.0')
