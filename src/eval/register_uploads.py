import os
import shutil
import json
import datetime
import glob

# Paths
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
MODELS_DIR = os.path.join(ROOT_DIR, "models", "registered")
DATA_DIR = os.path.join(ROOT_DIR, "data", "experimental")
OUTPUTS_DIR = os.path.join(ROOT_DIR, "outputs")

# Ensure directories exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

def register_model(src_path, model_name, origin, notes):
    dst_path = os.path.join(MODELS_DIR, os.path.basename(src_path))
    if not os.path.exists(dst_path):
        print(f"Copying {src_path} to {dst_path}")
        shutil.copy2(src_path, dst_path)
    
    metadata = {
        "model_name": model_name,
        "path": f"models/registered/{os.path.basename(src_path)}",
        "origin": origin,
        "notes": notes,
        "registered_at": datetime.datetime.now().isoformat()
    }
    
    json_path = os.path.join(MODELS_DIR, f"{model_name}.json")
    with open(json_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Registered model: {model_name} at {json_path}")

def main():
    print(f"Root dir: {ROOT_DIR}")
    
    # 1. Register Physics Pretrained Model
    current_model = os.path.join(OUTPUTS_DIR, "spectrum_mlp.pth")
    if os.path.exists(current_model):
        register_model(current_model, "physics_pretrained", "pretrained", "Original physics-guided baseline model")
    else:
        print(f"Warning: Base model not found at {current_model}")

    # 2. Find and Register Uploaded Model (final_demo_model.pth)
    # Search in common locations relative to root or typical upload paths
    search_paths = [
        os.path.join(ROOT_DIR, "final_demo_model.pth"),
        os.path.join(os.path.expanduser("~"), "Documents", "Prediction-of-Optical-Absoroption-Spectrum-of-Nanomaterials", "final_demo_model.pth")
    ]
    
    found_upload = False
    for p in search_paths:
        if os.path.exists(p):
            register_model(p, "final_demo_model", "fine-tuned", "User uploaded fine-tuned model checkpoint")
            found_upload = True
            break
            
    if not found_upload:
        # Fallback search
        print("Searching via glob...")
        matches = glob.glob(os.path.join(ROOT_DIR, "**", "final_demo_model.pth"), recursive=True)
        if matches:
             register_model(matches[0], "final_demo_model", "fine-tuned", "User uploaded fine-tuned model checkpoint")

    # 3. Move/Copy Experimental Data
    # Look for img_graph folder
    img_graph_candidates = glob.glob(os.path.join(ROOT_DIR, "**", "img_graph"), recursive=True)
    
    for src_dir in img_graph_candidates:
        if "data/experimental" in src_dir.replace("\\", "/"): continue # Skip if already in dest
        
        print(f"Found data folder at: {src_dir}")
        # Copy contents to data/experimental
        for item in os.listdir(src_dir):
            s = os.path.join(src_dir, item)
            d = os.path.join(DATA_DIR, item)
            if os.path.isdir(s):
                if not os.path.exists(d):
                    shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
        print(f"Copied data to {DATA_DIR}")

if __name__ == "__main__":
    main()
