import h5py
import json

def check(filename):
    with h5py.File(filename, 'r') as f:
        if 'model_config' in f.attrs:
            raw = f.attrs['model_config']
            if isinstance(raw, bytes): raw = raw.decode('utf-8')
            print(f"Contains FixedFlatten: {'FixedFlatten' in raw}")
            if 'FixedFlatten' in raw:
                # show a snippet
                idx = raw.find('FixedFlatten')
                print(raw[idx-20:idx+40])

if __name__ == "__main__": check('model.h5')
