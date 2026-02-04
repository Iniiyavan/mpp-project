import os
import tensorflow as tf
import tf_keras as keras
from tf_keras.applications import VGG16
from tf_keras.models import Sequential
from tf_keras.layers import Dense, Flatten, Dropout
import numpy as np

def reconstruct_model():
    """Reconstruct the exact model architecture and load weights"""
    print("🔄 Reconstructing model architecture...")

    # Create VGG16 base (exactly as in the original model)
    vgg_base = VGG16(
        weights='imagenet',
        include_top=False,
        input_shape=(128, 128, 3)
    )

    # Freeze the VGG16 layers (as in original)
    for layer in vgg_base.layers:
        layer.trainable = False

    # Build the complete model architecture
    model = Sequential([
        vgg_base,  # This replaces the Functional layer
        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.3),
        Dense(1, activation='sigmoid')
    ])

    print("📥 Loading weights from model.h5...")

    try:
        # Load weights from the original model
        model.load_weights('model.h5', by_name=False, skip_mismatch=False)
        print("✅ Weights loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load weights: {e}")
        return None

    # Test the model with a dummy input
    print("🧪 Testing model...")
    dummy_input = np.random.random((1, 128, 128, 3)).astype(np.float32)
    try:
        prediction = model.predict(dummy_input, verbose=0)
        print(f"✅ Model working! Sample prediction: {prediction[0][0]:.4f}")
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return None

    return model

def save_reconstructed_model(model, output_path='model_reconstructed.h5'):
    """Save the reconstructed model"""
    try:
        model.save(output_path, save_format='h5')
        print(f"💾 Reconstructed model saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Failed to save model: {e}")
        return None

if __name__ == "__main__":
    model = reconstruct_model()
    if model:
        saved_path = save_reconstructed_model(model)
        if saved_path:
            print("🎉 Success! Use the reconstructed model in your app.")
        else:
            print("❌ Model reconstruction completed but saving failed.")
    else:
        print("❌ Model reconstruction failed.")
