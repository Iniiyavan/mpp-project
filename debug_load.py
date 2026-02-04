import os
import traceback
# Suppress TF logs to see only the error
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

def test_load():
    try:
        import tf_keras as keras
        print("Attempting with tf_keras...")
        model = keras.models.load_model('model.h5', compile=False)
        print("SUCCESS")
    except Exception as e:
        print(f"tf_keras FAILED: {str(e)}")
        try:
            import tensorflow.keras as keras2
            print("Attempting with tensorflow.keras...")
            model = keras2.models.load_model('model.h5', compile=False)
            print("SUCCESS")
        except Exception as e2:
            print(f"tensorflow.keras FAILED: {str(e2)}")
            print("\nFULL TRACEBACK:")
            traceback.print_exc()

if __name__ == "__main__":
    test_load()
