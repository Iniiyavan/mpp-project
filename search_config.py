import h5py
import json
import re

try:
    with h5py.File('model.h5', 'r') as f:
        model_config = f.attrs.get('model_config')
        if model_config:
            if isinstance(model_config, bytes):
                model_config = model_config.decode('utf-8')
            
            # Find dimensions like [null, 128, 128, 3] or similar
            matches = re.findall(r'\[null,\s*\d+,\s*\d+,\s*\d+\]', model_config)
            print(f"FOUND_SHAPES: {matches}")
            
            # Find output classes
            if '"units": 1' in model_config:
                print("OUTPUT_TYPE: Binary (Sigmoid/1 unit)")
            elif '"units": 2' in model_config:
                print("OUTPUT_TYPE: Multi-class (2 units)")
                
except Exception as e:
    print(f"ERROR: {str(e)}")
