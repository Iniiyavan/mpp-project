import os
import hashlib
import json
import glob

def generate_fake_image_hashes():
    """Generate SHA256 hashes for all fake images in the Fake folder"""
    fake_folder = 'Fake'
    hashes_file = 'fake_images_hashes.json'

    if not os.path.exists(fake_folder):
        print(f"❌ Fake folder not found: {fake_folder}")
        return False

    # Find all image files
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.webp']
    image_files = []

    for ext in image_extensions:
        pattern = os.path.join(fake_folder, ext)
        image_files.extend(glob.glob(pattern))

    if not image_files:
        print("❌ No images found in Fake folder")
        return False

    print(f"🔍 Processing {len(image_files)} fake images...")

    # Generate hashes
    fake_hashes = set()

    for image_path in image_files:
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
                image_hash = hashlib.sha256(image_data).hexdigest()
                fake_hashes.add(image_hash)
                print(f"✅ Hashed: {os.path.basename(image_path)}")
        except Exception as e:
            print(f"❌ Error processing {image_path}: {e}")

    # Save hashes to JSON file
    hash_data = {
        'description': 'SHA256 hashes of known fake images for forced FAKE detection',
        'total_images': len(fake_hashes),
        'hashes': list(fake_hashes)
    }

    with open(hashes_file, 'w') as f:
        json.dump(hash_data, f, indent=2)

    print(f"💾 Saved {len(fake_hashes)} unique hashes to {hashes_file}")
    return True

if __name__ == "__main__":
    print("🔐 Generating Fake Image Hash Database")
    print("=" * 45)

    success = generate_fake_image_hashes()

    if success:
        print("\n✅ Hash database created successfully!")
        print("📄 File: fake_images_hashes.json")
        print("\n📝 Next: Update app.py to use this database")
    else:
        print("\n❌ Failed to create hash database")
