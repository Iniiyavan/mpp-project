import h5py
import json

def restore_flatten(filename):
    with h5py.File(filename, 'r+') as f:
        if 'model_config' in f.attrs:
            raw = f.attrs['model_config']
            if isinstance(raw, bytes):
                raw = raw.decode('utf-8')
            config = json.loads(raw)
            
            def fix(obj):
                if isinstance(obj, dict):
                    if obj.get('class_name') == 'FixedFlatten':
                        print("Restoring FixedFlatten -> Flatten")
                        obj['class_name'] = 'Flatten'
                    for v in obj.values():
                        fix(v)
                elif isinstance(obj, list):
                    for item in obj:
                        fix(item)
            
            fix(config)
            f.attrs['model_config'] = json.dumps(config).encode('utf-8')
            print("Done")

if __name__ == "__main__":
    restore_flatten('model.h5')
