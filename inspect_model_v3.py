import os
import tensorflow as tf

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    # Try loading without compiling to see if it works
    model = tf.keras.models.load_model('model.h5', compile=False)
    
    # Try to get input shape from the first layer if model.input_shape fails
    try:
        input_shape = model.input_shape
    except:
        input_shape = model.layers[0].input_shape
        
    output_shape = model.output_shape
    
    with open('model_summary.txt', 'w') as f:
        f.write(f"INPUT: {input_shape}\n")
        f.write(f"OUTPUT: {output_shape}\n")
    print("SUCCESS")
except Exception as e:
    with open('model_summary.txt', 'w') as f:
        f.write(f"ERROR: {str(e)}\n")
    print("FAILED")
