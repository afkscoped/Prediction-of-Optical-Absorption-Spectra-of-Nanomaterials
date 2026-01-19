import os
import torch
import numpy as np
import cv2
from src.models.mlp import SpectrumMLP

class ModelWrapper:
    def __init__(self, model_path, device="cpu"):
        self.device = device
        self.model_path = model_path
        
        # Load constraints/normalization
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.X_mean = np.load(os.path.join(self.base_dir, "data/processed/X_mean.npy"))
        self.X_std = np.load(os.path.join(self.base_dir, "data/processed/X_std.npy"))
        self.wavelengths = np.load(os.path.join(self.base_dir, "data/processed/wavelengths.npy"))
        
        # Load Model
        # TODO: Detect architecture if multiple exist. For now assume SpectrumMLP
        self.model = SpectrumMLP(in_dim=4, out_dim=251)
        
        # Determine how to load (full model vs state_dict)
        try:
            state_dict = torch.load(model_path, map_location=device)
            # If it's a lightning checkpoint, keys might be different. 
            # Simple check for now.
            if "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
                # Remove 'model.' prefix if present (common in Lightning)
                state_dict = {k.replace("model.", ""): v for k, v in state_dict.items()}
            
            self.model.load_state_dict(state_dict)
        except Exception as e:
            print(f"Failed to load state dict, trying full model load: {e}")
            self.model = torch.load(model_path, map_location=device)
            
        self.model.to(device)
        self.model.eval()

    def extract_features(self, img_path):
        # Reusing logic from predict.py
        img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise ValueError(f"Could not load image {img_path}")

        if len(img.shape) == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        if img.dtype == np.uint16:
            img = (img / 65535.0 * 255).astype(np.uint8)
            
        img = cv2.resize(img, (512, 512))
        blur = cv2.GaussianBlur(img, (5,5), 0)
        _, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = np.ones((3,3), np.uint8)
        th = cv2.morphologyEx(th, cv2.MORPH_OPEN, kernel, iterations=1)
        cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        areas = []
        aspect_ratios = []
        for c in cnts:
            a = cv2.contourArea(c)
            if a > 20:
                areas.append(a)
                x,y,w,h = cv2.boundingRect(c)
                if h > 0: aspect_ratios.append(w/h)
                else: aspect_ratios.append(1.0)

        if len(areas) == 0:
            # Fallback for empty image or bad segmentation
            raise ValueError("No particles detected. Try adjusting image contrast or using a cleaner micrograph.")

        areas = np.array(areas)
        eq_diam = np.sqrt(4 * areas / np.pi)

        feats = np.array([
            eq_diam.mean(),
            eq_diam.std(),
            len(eq_diam),
            np.mean(aspect_ratios)
        ], dtype=np.float32)
        return feats

    def predict(self, image_path=None, features=None):
        if image_path:
            feats = self.extract_features(image_path)
        elif features is not None:
            feats = features
        else:
            raise ValueError("Must provide image_path or features")

        # Normalize
        feats_norm = (feats - self.X_mean) / self.X_std
        
        # Predict
        with torch.no_grad():
            tensor = torch.tensor(feats_norm, dtype=torch.float32).unsqueeze(0).to(self.device)
            pred = self.model(tensor).cpu().numpy()[0]

        # Post-process stats
        peak_idx = np.argmax(pred)
        peak_nm = float(self.wavelengths[peak_idx])
        max_val = pred[peak_idx]
        half_max = max_val / 2.0
        
        indices = np.where(pred > half_max)[0]
        if len(indices) > 0:
            fwhm_nm = float(self.wavelengths[indices[-1]] - self.wavelengths[indices[0]])
        else:
            fwhm_nm = 0.0

        return {
            "wavelengths": self.wavelengths,
            "spectrum": pred,
            "peak_nm": peak_nm,
            "fwhm_nm": fwhm_nm,
            "features": feats
        }
