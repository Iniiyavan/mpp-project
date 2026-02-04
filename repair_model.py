import h5py
import json
import os

def repair():
    MODEL_PATH = 'model.h5'
    if not os.path.exists(MODEL_PATH):
        print("Model file not found!")
        return

    try:
        with h5py.File(MODEL_PATH, 'r+') as f:
            if 'model_config' in f.attrs:
                config_raw = f.attrs['model_config']
                if isinstance(config_raw, bytes):
                    config_raw = config_raw.decode('utf-8')
                
                config = json.loads(config_raw)
                
                # Fix ALL InputLayer instances by replacing batch_shape with shape argument
                def fix_input_layers(layers):
                    for layer in layers:
                        if layer['class_name'] == 'InputLayer':
                            print(f"Repairing InputLayer: {layer['config']['name']}")
                            # Remove batch_shape and add shape (required by newer Keras)
                            if 'batch_shape' in layer['config']:
                                del layer['config']['batch_shape']
                            layer['config']['shape'] = [128, 128, 3]
                            print(f"Fixed InputLayer config: {layer['config']}")
                        # Also check nested layers in Functional models
                        elif 'config' in layer and 'layers' in layer['config']:
                            fix_input_layers(layer['config']['layers'])

                layers = config['config']['layers']
                fix_input_layers(layers)

                new_config = json.dumps(config).encode('utf-8')
                f.attrs['model_config'] = new_config
                print("✅ Model Repaired successfully!")
            else:
                print("No config found in model.")
    except Exception as e:
        print(f"Repair failed: {str(e)}")

if __name__ == "__main__":
    repair()
