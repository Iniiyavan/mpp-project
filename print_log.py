with open('model_load_debug.log', 'r', encoding='utf-8') as f:
    content = f.read()
    # Print in chunks to avoid truncation
    print("--- START ---")
    chunk_size = 1000
    for i in range(0, len(content), chunk_size):
        print(content[i:i+chunk_size])
    print("--- END ---")
