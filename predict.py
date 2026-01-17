import os
import cv2
import numpy as np
import torch
import matplotlib
matplotlib.use("Agg")  # headless backend for Lightning
import matplotlib.pyplot as plt
from src.models.mlp import SpectrumMLP

# -------- Load normalization params --------
X_mean = np.load("data/processed/X_mean.npy")
X_std  = np.load("data/processed/X_std.npy")

# -------- Load wavelengths --------
wavelengths = np.load("data/processed/wavelengths.npy")

# -------- Load trained model --------
model = SpectrumMLP(in_dim=4, out_dim=251)
model.load_state_dict(torch.load("outputs/spectrum_mlp.pth", map_location="cpu"))
model.eval()

# -------- Image processing functions --------
def load_gray(path):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("Could not load image")

    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if img.dtype == np.uint16:
        img = (img / 65535.0 * 255).astype(np.uint8)

    return img

def extract_features(path):
    img = load_gray(path)
    img = cv2.resize(img, (512, 512))

    blur = cv2.GaussianBlur(img, (5,5), 0)
    _, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((3,3), np.uint8)
    th = cv2.morphologyEx(th, cv2.MORPH_OPEN, kernel, iterations=1)

    cnts,_ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    areas = []
    aspect_ratios = []

    for c in cnts:
        a = cv2.contourArea(c)
        if a > 20:
            areas.append(a)
            x,y,w,h = cv2.boundingRect(c)
            if h > 0:
                aspect_ratios.append(w/h)
            else:
                aspect_ratios.append(1.0)

    if len(areas) == 0:
        raise ValueError("No particles detected")

    areas = np.array(areas)
    eq_diam = np.sqrt(4 * areas / np.pi)

    feats = np.array([
        eq_diam.mean(),
        eq_diam.std(),
        len(eq_diam),
        np.mean(aspect_ratios)
    ], dtype=np.float32)

    return feats

# --------- MAIN ---------
if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Predict absorption spectrum from TEM image")
    parser.add_argument("--image", type=str, required=True, help="Path to input TEM image")
    parser.add_argument("--output", type=str, default="outputs/predicted_spectrum.png", help="Path to save output plot")
    args = parser.parse_args()

    # Normalize paths
    image_path = args.image
    out_path = args.output

    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        sys.exit(1)

    try:
        print(f"Processing: {image_path}")
        feats = extract_features(image_path)
        
        # Normalize
        feats_norm = (feats - X_mean) / X_std
        
        # Predict
        with torch.no_grad():
            pred = model(torch.tensor(feats_norm).unsqueeze(0)).numpy()[0]
        
        # --------- Plot & Save ---------
        os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
        
        plt.figure(figsize=(10,4))
        plt.plot(wavelengths, pred)
        plt.xlabel("Wavelength (nm)")
        plt.ylabel("Extinction (a.u.)")
        plt.title(f"Predicted Absorption: {os.path.basename(image_path)}")
        plt.grid(True)
        plt.tight_layout()
        
        plt.savefig(out_path, dpi=150)
        plt.close()
        
        print("======================================")
        print("Prediction complete!")
        print("Image:", image_path)
        print("Extracted features (Mean Diam, Std Diam, Count, AspRatio):")
        print(feats)
        print("Prediction min/max:", pred.min(), pred.max())
        print("Saved plot to:", out_path)
        print("======================================")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        sys.exit(1)

