import h5py
import json

try:
    with h5py.File('model.h5', 'r') as f:
        model_config = f.attrs.get('model_config')
        if model_config:
            if isinstance(model_config, bytes):
                model_config = model_config.decode('utf-8')
            config = json.loads(model_config)
            
            # Look for input shape in the config
            layers = config.get('config', {}).get('layers', [])
            input_shape = None
            if layers:
                first_layer = layers[0]
                input_shape = first_layer.get('config', {}).get('batch_input_shape')
            
            print(f"MODEL_CONFIG_FOUND: True")
            print(f"INPUT_SHAPE_FROM_CONFIG: {input_shape}")
        else:
            print("MODEL_CONFIG_FOUND: False")
except Exception as e:
    print(f"ERROR: {str(e)}")
