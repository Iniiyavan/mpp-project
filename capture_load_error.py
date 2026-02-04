import os
import traceback

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def capture_load():
    MODEL_PATH = 'model.h5'
    log = []
    
    try:
        import keras
        log.append(f"Keras version: {keras.__version__}")
        log.append("Attempting keras.models.load_model...")
        m = keras.models.load_model(MODEL_PATH, compile=False)
        log.append("✅ SUCCESS with standalone Keras")
    except Exception as e:
        log.append(f"❌ Standalone Keras FAILED: {str(e)}")
        log.append(traceback.format_exc())
        
        try:
            import tensorflow as tf
            log.append(f"TF version: {tf.__version__}")
            log.append("Attempting tf.keras.models.load_model...")
            m = tf.keras.models.load_model(MODEL_PATH, compile=False)
            log.append("✅ SUCCESS with tf.keras")
        except Exception as e2:
            log.append(f"❌ tf.keras FAILED: {str(e2)}")
            log.append(traceback.format_exc())

    with open('model_load_debug.log', 'w', encoding='utf-8') as f:
        f.write("\n".join(log))

if __name__ == "__main__":
    capture_load()
