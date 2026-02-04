import os
import tensorflow as tf
import tf_keras
import h5py

MODEL_PATH = 'model.h5'

def test():
    results = []
    
    # Method 1: tf.keras
    try:
        print("Testing tf.keras...")
        m = tf.keras.models.load_model(MODEL_PATH, compile=False)
        results.append("tf.keras: SUCCESS")
    except Exception as e:
        results.append(f"tf.keras ERROR: {str(e)}")
        
    # Method 2: tf_keras
    try:
        print("Testing tf_keras...")
        m = tf_keras.models.load_model(MODEL_PATH, compile=False)
        results.append("tf_keras: SUCCESS")
    except Exception as e:
        results.append(f"tf_keras ERROR: {str(e)}")

    # Method 3: keras (if exists)
    try:
        import keras
        print("Testing keras...")
        m = keras.models.load_model(MODEL_PATH, compile=False)
        results.append("keras: SUCCESS")
    except Exception as e:
        results.append(f"keras ERROR: {str(e)}")

    with open('final_attempt.txt', 'w') as f:
        f.write("\n".join(results))

if __name__ == "__main__":
    test()
