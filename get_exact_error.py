import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
import keras
import traceback
import sys

def get_actual_error():
    try:
        print("Attempting to load model.h5...")
        model = keras.models.load_model('model.h5', compile=False)
        print("SUCCESS")
    except Exception as e:
        print("FAILED")
        traceback.print_exc()

if __name__ == "__main__":
    get_actual_error()
