import h5py
import json

def patch_h5_config(filename):
    try:
        with h5py.File(filename, 'r+') as f:
            if 'model_config' in f.attrs:
                config_str = f.attrs['model_config']
                if isinstance(config_str, bytes):
                    config_str = config_str.decode('utf-8')
                
                # Check if it's JSON
                config = json.loads(config_str)
                
                # Clean batch_shape from all layers
                def clean_layer(obj):
                    if isinstance(obj, dict):
                        if 'config' in obj:
                            if 'batch_shape' in obj['config']:
                                print(f"Removing batch_shape from {obj.get('class_name', 'layer')}")
                                obj['config'].pop('batch_shape')
                        for k, v in obj.items():
                            clean_layer(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            clean_layer(item)

                clean_layer(config)
                
                # Save back
                new_config_str = json.dumps(config)
                f.attrs['model_config'] = new_config_str.encode('utf-8')
                print("✅ Model config patched successfully!")
                return True
            else:
                print("❌ No model_config found in attributes.")
                return False
    except Exception as e:
        print(f"❌ Patch failed: {str(e)}")
        return False

if __name__ == "__main__":
    patch_h5_config('model.h5')
