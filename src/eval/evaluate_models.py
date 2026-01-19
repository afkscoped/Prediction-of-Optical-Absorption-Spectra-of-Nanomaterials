import os
import argparse
import json
import glob
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime
from src.eval.infer_multi import ModelWrapper

def compute_metrics(y_true, y_pred, peak_tol=5.0, wavelengths=None):
    # MSE/RMSE/MAE
    mse = np.mean((y_true - y_pred)**2)
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(y_true - y_pred))
    
    # SAM (Spectral Angle Mapper)
    dot = np.dot(y_true, y_pred)
    norm_true = np.linalg.norm(y_true)
    norm_pred = np.linalg.norm(y_pred)
    cosine = dot / (norm_true * norm_pred + 1e-8)
    sam_rad = np.arccos(np.clip(cosine, -1.0, 1.0))
    sam_deg = np.degrees(sam_rad)
    
    # Peak Stats
    true_peak_idx = np.argmax(y_true)
    pred_peak_idx = np.argmax(y_pred)
    
    if wavelengths is not None:
        true_peak_nm = wavelengths[true_peak_idx]
        pred_peak_nm = wavelengths[pred_peak_idx]
        peak_error = abs(true_peak_nm - pred_peak_nm)
        peak_within_tol = 1 if peak_error <= peak_tol else 0
    else:
        true_peak_nm = 0
        pred_peak_nm = 0
        peak_error = 0
        peak_within_tol = 0
        
    return {
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
        "sam_deg": float(sam_deg),
        "true_peak_nm": float(true_peak_nm),
        "pred_peak_nm": float(pred_peak_nm),
        "peak_error_nm": float(peak_error),
        "peak_within_tol": int(peak_within_tol)
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", type=str, default="all", help="Model names or 'all'")
    parser.add_argument("--data", type=str, required=True, help="Data directory")
    parser.add_argument("--outdir", type=str, required=True, help="Output directory")
    parser.add_argument("--peak_tol", type=float, default=5.0, help="Peak tolerance (nm)")
    args = parser.parse_args()
    
    os.makedirs(args.outdir, exist_ok=True)
    
    # 1. Discover Models
    reg_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models", "registered")
    if args.models == "all":
        model_files = glob.glob(os.path.join(reg_dir, "*.json"))
    else:
        names = args.models.split(",")
        model_files = [os.path.join(reg_dir, f"{n}.json") for n in names]
        
    loaded_models = {}
    for mf in model_files:
        if not os.path.exists(mf):
            print(f"Warning: Model meta {mf} not found")
            continue
        with open(mf, 'r') as f:
            meta = json.load(f)
        
        # Path resolution (handle relative paths in JSON)
        model_path = meta['path']
        if not os.path.isabs(model_path):
            model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), model_path)
            
        try:
            print(f"Loading {meta['model_name']} from {model_path}...")
            loaded_models[meta['model_name']] = ModelWrapper(model_path)
        except Exception as e:
            print(f"Failed to load {meta['model_name']}: {e}")

    # 2. Discover Data
    # Look for format: image.{png,jpg} and spectrum.{csv,npy}
    # For now, just glob images and check if spectrum exists
    image_exts = ['*.jpg', '*.jpeg', '*.png', '*.tif']
    images = []
    for ext in image_exts:
        images.extend(glob.glob(os.path.join(args.data, "**", ext), recursive=True))
        
    print(f"Found {len(images)} images to process")
    
    results = []
    
    # 3. Evaluate Loop
    for img_path in images:
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        dir_name = os.path.dirname(img_path)
        
        # Try to find ground truth
        # Convention: same basename but .csv or sequence in csv
        gt_spectrum = None
        
        # Simple check: base_name.csv in same folder?
        csv_path = os.path.join(dir_name, base_name + ".csv")
        npy_path = os.path.join(dir_name, base_name + ".npy")
        
        if os.path.exists(csv_path):
            try:
                df = pd.read_csv(csv_path)
                if df.shape[1] == 1: gt_spectrum = df.iloc[:,0].values
                elif 'spectrum' in df.columns: gt_spectrum = df['spectrum'].values
            except: pass
        
        # Enhanced Matching Logic for Split Figures (Ported from plot_all.py)
        if gt_spectrum is None:
            # Check for _left / _right swap
            filename = os.path.basename(img_path)
            base_full = os.path.splitext(filename)[0]
            candidate_csv = None
            
            if base_full.endswith("_left"):
                candidate_csv = os.path.join(dir_name, base_full[:-5] + "_right.csv")
            elif base_full.endswith("_right"):
                candidate_csv = os.path.join(dir_name, base_full[:-6] + "_left.csv")
                
            if candidate_csv and os.path.exists(candidate_csv):
                try:
                    df = pd.read_csv(candidate_csv)
                    if 'spectrum' in df.columns: gt_spectrum = df['spectrum'].values
                except: pass
        elif os.path.exists(npy_path):
            try: gt_spectrum = np.load(npy_path)
            except: pass
            
        # Run models
        for m_name, wrapper in loaded_models.items():
            try:
                res = wrapper.predict(img_path)
                
                row = {
                    "sample_id": base_name,
                    "image_path": img_path,
                    "model_name": m_name,
                    "pred_peak_nm": res['peak_nm'],
                    "pred_fwhm_nm": res['fwhm_nm']
                }
                
                if gt_spectrum is not None:
                    # Interpolate GT to match prediction wavelengths
                    # Prediction wavelengths from wrapper
                    pred_w = res['wavelengths']
                    
                    # Assume GT wavelengths? We need to load them to interpolate.
                    # Currently we only loaded values.
                    # Reread CSV to get wavelengths
                    try:
                        # Find the path again (csv_path or candidate_csv)
                        active_csv = csv_path if os.path.exists(csv_path) else candidate_csv
                        if active_csv and os.path.exists(active_csv):
                            df = pd.read_csv(active_csv)
                            if 'wavelength' in df.columns:
                                gt_w = df['wavelength'].values
                                gt_vals = df['spectrum'].values
                                # Interpolate
                                gt_spectrum = np.interp(pred_w, gt_w, gt_vals)
                    except:
                        # Fallback: if we can't interpolate, we can't compare unless lengths match exactly
                        pass

                if gt_spectrum is not None and len(gt_spectrum) == len(res['spectrum']):
                    metrics = compute_metrics(gt_spectrum, res['spectrum'], args.peak_tol, res['wavelengths'])
                    row.update(metrics)
                else:
                    # No GT or size mismatch
                    row.update({k: None for k in ["mse","rmse","mae","sam_deg","true_peak_nm","peak_error_nm","peak_within_tol"]})
                
                results.append(row)
                
                # Save prediction
                pred_df = pd.DataFrame({
                    "wavelength": res['wavelengths'],
                    "prediction": res['spectrum']
                })
                pred_save_dir = os.path.join(args.outdir, "predictions")
                os.makedirs(pred_save_dir, exist_ok=True)
                pred_df.to_csv(os.path.join(pred_save_dir, f"{m_name}_{base_name}.csv"), index=False)
                
            except Exception as e:
                print(f"Error evaluating {m_name} on {base_name}: {e}")

    # 4. Summary & Reports
    if not results:
        print("No results computed.")
        return

    df_res = pd.DataFrame(results)
    df_res.to_csv(os.path.join(args.outdir, "results_per_sample.csv"), index=False)
    
    summary = {
        "run_id": datetime.now().isoformat(),
        "n_samples": len(images),
        "models": {}
    }
    
    for m_name in loaded_models.keys():
        m_df = df_res[df_res.model_name == m_name]
        if m_df.empty: continue
        
        # Check if we have metrics (some GT)
        if m_df["mse"].notnull().any():
            stats = {
                "mse": float(m_df["mse"].mean()),
                "rmse": float(m_df["rmse"].mean()),
                "mae": float(m_df["mae"].mean()),
                "sam_deg": float(m_df["sam_deg"].mean()),
                "peak_error_mean": float(m_df["peak_error_nm"].mean()),
                "peak_error_std": float(m_df["peak_error_nm"].std()),
                # Precision/Recall/F1 (tolerance based)
                "samples_with_gt": int(m_df["mse"].notnull().sum()),
                "tp": int(m_df["peak_within_tol"].sum())
            }
            # As per instruction: Precision = TP/N (since we always predict)
            n_gt = stats["samples_with_gt"]
            stats["precision"] = stats["tp"] / n_gt if n_gt > 0 else 0
            stats["recall"] = stats["tp"] / n_gt if n_gt > 0 else 0 # Identical in this definition
            stats["f1"] = 2 * stats["precision"] * stats["recall"] / (stats["precision"] + stats["recall"] + 1e-9)
            
            summary["models"][m_name] = stats
        else:
            summary["models"][m_name] = "No Ground Truth Available"

    with open(os.path.join(args.outdir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)
        
    print(f"Evaluation complete. Saved to {args.outdir}")

if __name__ == "__main__":
    main()
