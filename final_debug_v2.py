import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
import keras
import traceback
import sys

# Ensure output is UTF-8 to handle any weird characters
sys.stdout.reconfigure(encoding='utf-8')

def test():
    try:
        print(f"Keras Version: {keras.__version__}")
        print("Loading model.h5...")
        model = keras.models.load_model('model.h5', compile=False)
        print("SUCCESS")
        print(f"Input Shape: {model.input_shape}")
    except Exception as e:
        print("FAILED")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    test()
