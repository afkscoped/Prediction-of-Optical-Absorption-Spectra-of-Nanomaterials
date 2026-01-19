import os
import glob
import json
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from src.eval.infer_multi import ModelWrapper

def main():
    # Configuration
    DATA_DIR = "data/experimental_processed"
    MODELS_DIR = "models/registered"
    OUT_DIR = "outputs/plots_comparison"
    
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # 1. Load Models
    models = {}
    model_files = glob.glob(os.path.join(MODELS_DIR, "*.json"))
    for mf in model_files:
        with open(mf) as f:
            meta = json.load(f)
        name = meta['model_name']
        path = meta['path']
        if not os.path.isabs(path):
            path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), path))
            
        print(f"Loading {name}...")
        try:
            models[name] = ModelWrapper(path)
        except Exception as e:
            print(f"Failed to load {name}: {e}")

    # 2. Find Samples (images with CSV ground truth)
    gt_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    print(f"Found {len(gt_files)} samples with Ground Truth.")
    
    for gt_path in gt_files:
        filename = os.path.basename(gt_path)
        base_name_full = os.path.splitext(filename)[0]
        
        # Logic to match Plot (CSV) with TEM (PNG)
        # They are usually split into _left and _right from the same original file.
        if base_name_full.endswith("_left"):
            root = base_name_full[:-5]
            candidate = os.path.join(DATA_DIR, root + "_right.png")
        elif base_name_full.endswith("_right"):
            root = base_name_full[:-6]
            candidate = os.path.join(DATA_DIR, root + "_left.png")
        else:
            candidate = os.path.join(DATA_DIR, base_name_full + ".png")
            
        if os.path.exists(candidate):
            img_path = candidate
        else:
            print(f"Skipping {filename}: Corresponding TEM image not found at {candidate}")
            continue
            
        print(f"Plotting {root} (GT: {base_name_full}, Image: {os.path.basename(img_path)})...")
        
        # Load GT
        df_gt = pd.read_csv(gt_path)
        
        # Plot Setup
        plt.figure(figsize=(12, 6))
        
        # Plot GT
        plt.plot(df_gt['wavelength'], df_gt['spectrum'], label='Ground Truth (Digitized)', color='black', linewidth=2.5, linestyle='--')
        
        # Run Models
        for m_name, model in models.items():
            try:
                res = model.predict(image_path=img_path)
                plt.plot(res['wavelengths'], res['spectrum'], label=f'Pred: {m_name}', linewidth=1.5)
            except Exception as e:
                print(f"  Error running {m_name}: {e}")
                
        plt.title(f"Spectral Prediction: {root}")
        plt.xlabel("Wavelength (nm)")
        plt.ylabel("Absorbance (a.u.)")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        out_path = os.path.join(OUT_DIR, f"{root}_comparison.png")
        plt.savefig(out_path, dpi=150)
        plt.close()
        
    print(f"All plots saved to {OUT_DIR}")

if __name__ == "__main__":
    main()
