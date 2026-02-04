import os
import tf_keras as keras
import tensorflow as tf

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    model = keras.models.load_model('model.h5', compile=False)
    print(f"INPUT: {model.input_shape}")
    print(f"OUTPUT: {model.output_shape}")
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}")
