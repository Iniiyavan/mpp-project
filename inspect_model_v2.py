import os
import tensorflow as tf

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    model = tf.keras.models.load_model('model.h5')
    
    input_shape = model.input_shape
    output_shape = model.output_shape
    
    with open('model_summary.txt', 'w') as f:
        f.write(f"INPUT: {input_shape}\n")
        f.write(f"OUTPUT: {output_shape}\n")
    print("SUCCESS")
except Exception as e:
    with open('model_summary.txt', 'w') as f:
        f.write(f"ERROR: {str(e)}\n")
    print("FAILED")
