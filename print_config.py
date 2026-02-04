import h5py
import json

try:
    with h5py.File('model.h5', 'r') as f:
        model_config = f.attrs.get('model_config')
        if model_config:
            if isinstance(model_config, bytes):
                model_config = model_config.decode('utf-8')
            print(model_config[:2000]) # First 2000 chars should be enough for metadata
except Exception as e:
    print(f"ERROR: {str(e)}")
