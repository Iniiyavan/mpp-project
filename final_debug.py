import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
import keras
import traceback

def test():
    try:
        print(f"Keras Version: {keras.__version__}")
        print(f"Loading model.h5...")
        model = keras.models.load_model('model.h5', compile=False)
        print("✅ SUCCESS!")
        print(f"Input Shape: {model.input_shape}")
    except Exception as e:
        print("❌ FAILED")
        traceback.print_exc()

if __name__ == "__main__":
    test()
