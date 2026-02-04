import h5py
import json

with h5py.File('model.h5', 'r') as f:
    config = json.loads(f.attrs.get('model_config').decode('utf-8'))
    for layer in config['config']['layers']:
        print(f"Layer: {layer['class_name']}")
        print(f"  Config: {layer['config'].keys()}")
