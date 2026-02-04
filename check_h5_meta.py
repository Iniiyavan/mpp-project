import h5py
try:
    with h5py.File('model.h5', 'r') as f:
        print(f"Keras Version: {f.attrs.get('keras_version')}")
        print(f"Backend: {f.attrs.get('backend')}")
        print(f"Root Keys: {list(f.keys())}")
except Exception as e:
    print(f"ERROR: {str(e)}")
