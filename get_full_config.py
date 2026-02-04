import h5py
import json

def get_config():
    with h5py.File('model.h5', 'r') as f:
        model_config = f.attrs.get('model_config')
        if isinstance(model_config, bytes):
            model_config = model_config.decode('utf-8')
        return model_config

if __name__ == "__main__":
    print(get_config())
