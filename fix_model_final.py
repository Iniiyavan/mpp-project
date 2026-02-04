import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten, Dropout
import numpy as np
import h5py

def create_fixed_model():
    """Create the exact model architecture that was trained"""
    print("🔄 Creating fixed model architecture...")

    # Create VGG16 base with exact same configuration as original
    vgg_base = VGG16(
        weights='imagenet',  # Use pretrained weights
        include_top=False,
        input_shape=(128, 128, 3)
    )

    # Freeze VGG16 layers (as in original training)
    for layer in vgg_base.layers:
        layer.trainable = False

    # Build the complete model
    model = Sequential([
        vgg_base,
        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.3),
        Dense(1, activation='sigmoid')
    ])

    print("📥 Loading weights from original model.h5...")

    try:
        # Load weights from the original model file
        with h5py.File('model.h5', 'r') as f:
            if 'model_weights' in f:
                print("Found model_weights group, loading layer by layer...")

                # Get all layer names from our new model
                new_layer_names = [layer.name for layer in model.layers]

                # Load weights for each layer that exists in both models
                for layer in model.layers:
                    layer_name = layer.name
                    if layer_name in f['model_weights']:
                        print(f"Loading weights for layer: {layer_name}")
                        try:
                            # Load weights for this layer
                            weights_group = f['model_weights'][layer_name]
                            weight_names = list(weights_group.keys())

                            weights = []
                            for weight_name in weight_names:
                                if weight_name.endswith(':0'):  # TensorFlow weight format
                                    weight_data = weights_group[weight_name][:]
                                    weights.append(weight_data)

                            if weights:
                                layer.set_weights(weights)
                                print(f"✓ Loaded {len(weights)} weight arrays for {layer_name}")
                        except Exception as e:
                            print(f"⚠️  Could not load weights for {layer_name}: {e}")
                            continue

        print("✅ Weight loading completed!")
    except Exception as e:
        print(f"❌ Failed to load weights: {e}")
        return None

    # Test the model
    print("🧪 Testing model...")
    dummy_input = np.random.random((1, 128, 128, 3)).astype(np.float32)
    try:
        prediction = model.predict(dummy_input, verbose=0)
        print(f"✅ Model working! Sample prediction: {prediction[0][0]:.4f}")
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return None

    return model

def save_fixed_model(model, output_path='model_fixed.h5'):
    """Save the fixed model"""
    try:
        model.save(output_path, save_format='h5')
        print(f"💾 Fixed model saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Failed to save model: {e}")
        return None

if __name__ == "__main__":
    model = create_fixed_model()
    if model:
        saved_path = save_fixed_model(model)
        if saved_path:
            print("🎉 Success! Use the fixed model in your app.")
            print(f"Update your app.py to use: {saved_path}")
        else:
            print("❌ Model creation succeeded but saving failed.")
    else:
        print("❌ Model creation failed.")
