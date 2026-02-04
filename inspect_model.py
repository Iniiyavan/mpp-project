import tensorflow as tf
try:
    model = tf.keras.models.load_model('model.h5')
    # Get input shape
    if isinstance(model.input_shape, list):
        input_shape = model.input_shape[0]
    else:
        input_shape = model.input_shape
    print(f"INPUT_SHAPE_VALUE: {input_shape}")
    
    # Get output shape
    if isinstance(model.output_shape, list):
        output_shape = model.output_shape[0]
    else:
        output_shape = model.output_shape
    print(f"OUTPUT_SHAPE_VALUE: {output_shape}")
except Exception as e:
    print(f"ERROR: {str(e)}")
