import os
import cv2
import numpy as np
import pandas as pd
import glob

def categorize_roi(roi):
    """
    Decide if an ROI is a TEM image or a Plot based on texture/entropy.
    TEM: High texture, full range of gray.
    Plot: Mostly white background, sharp lines.
    """
    if roi.size == 0: return None
    
    # Check background color (assume plot has white background)
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    # Calculate % of white pixels (>240)
    white_pixels = np.sum(gray > 240)
    total_pixels = gray.size
    white_ratio = white_pixels / total_pixels
    
    # Calculate standard deviation of laplacian (texture sharpness)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    score = np.var(lap)
    
    # Heuristic: Plots have high white ratio (> 50%). TEMs are usually darker/more textured everywhere.
    if white_ratio > 0.4:
        # Likely a plot (or empty space)
        # Check if it has content (lines)
        if score < 50: # Very plain
            return "empty"
        return "plot"
    else:
        return "tem"

def extract_curve_from_plot(roi, save_path):
    """
    Extract the dominant curve from a plot ROI.
    """
    h, w = roi.shape[:2]
    
    # 1. Detect axes (black L-shape) to define data area
    # Simplified: assume margins
    margin_x = int(w * 0.15)
    margin_y = int(h * 0.15)
    
    plot_area = roi[margin_y:h-margin_y, margin_x:w-margin_x]
    if plot_area.size == 0: return None
    
    # 2. Color segmentation for the curve
    # Convert to HSV
    hsv = cv2.cvtColor(plot_area, cv2.COLOR_BGR2HSV)
    
    # We look for non-grayscale colors (S > something)
    # or just dark lines that aren't axes?
    # Usually curves are colored red/blue/green in these figures.
    
    # Mask for colored pixels (S > 50)
    mask = hsv[:,:,1] > 40
    
    # Get coordinates of masked pixels
    ys, xs = np.where(mask)
    
    if len(xs) < 50:
        # Fallback: look for dark pixels that are NOT grid lines
        # Invert gray
        gray = cv2.cvtColor(plot_area, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
        ys, xs = np.where(thresh > 0)
        
    if len(xs) < 50:
        print("  No curve detected")
        return None
        
    # 3. Digitize
    # Sort by X
    sorted_indices = np.argsort(xs)
    xs_sorted = xs[sorted_indices]
    ys_sorted = ys[sorted_indices]
    
    # Deduplicate X (take mean Y for same X)
    unique_xs, indices = np.unique(xs_sorted, return_inverse=True)
    mean_ys = np.zeros_like(unique_xs, dtype=np.float64)
    for i, u_idx in enumerate(indices):
        mean_ys[u_idx] += ys_sorted[i]
        
    counts = np.bincount(indices)
    mean_ys /= counts
    
    # 4. Map to Physical Units (Wavelength vs Absorbance)
    # We don't have OCR, so we will normalize to standard range [400, 800]
    # Invert Y (image coords are top-down, plots are bottom-up)
    ph, pw = plot_area.shape[:2]
    # Norm Y: 0 (bottom) to 1 (top)
    norm_ys = 1.0 - (mean_ys / ph)
    # Norm X: 400 to 800
    norm_xs = 400 + (unique_xs / pw) * (800 - 400)
    
    # Interpolate to strictly even grid
    target_wavelengths = np.arange(400, 801, 2)
    target_spectrum = np.interp(target_wavelengths, norm_xs, norm_ys)
    
    # Smoothing
    target_spectrum = pd.Series(target_spectrum).rolling(5, min_periods=1, center=True).mean().values
    
    # Save CSV
    df = pd.DataFrame({"wavelength": target_wavelengths, "spectrum": target_spectrum})
    df.to_csv(save_path + ".csv", index=False)
    # Also save debug image
    cv2.imwrite(save_path + "_debug_crop.png", plot_area)
    return True

def process_file(filepath, out_dir):
    filename = os.path.basename(filepath)
    base_name = os.path.splitext(filename)[0]
    
    img = cv2.imread(filepath)
    if img is None: return
    
    print(f"Processing {filename}...")
    h, w = img.shape[:2]
    
    # Heuristic Split: Check aspect ratio
    # Many figures are [TEM] [PLOT] side-by-side
    panels = []
    
    mid_x = w // 2
    panels.append((img[:, :mid_x], "left"))
    panels.append((img[:, mid_x:], "right"))
    
    found_tem = False
    found_plot = False
    
    for roi, pos in panels:
        cat = categorize_roi(roi)
        print(f"  Panel {pos}: {cat}")
        
        save_name = os.path.join(out_dir, f"{base_name}_{pos}")
        
        if cat == "tem":
            # Save as TEM sample
            cv2.imwrite(save_name + ".png", roi)
            found_tem = True
            
            # If we already found a plot, verify naming for linkage
            # (Simplification: we assume 1 tem 1 plot per file for this demo)
            
        elif cat == "plot":
            # Extract data
            success = extract_curve_from_plot(roi, save_name)
            if success:
                found_plot = True
    
    # If we split vertically and didn't find good stuff, try horizontal split?
    # (Skip for now, assuming standard side-by-side layout from user samples)

def main():
    raw_dir = "data/experimental"
    out_dir = "data/experimental_processed"
    os.makedirs(out_dir, exist_ok=True)
    
    # Process all images
    exts = ['*.jpg', '*.png', '*.jpeg']
    files = []
    for e in exts:
        files.extend(glob.glob(os.path.join(raw_dir, e)))
        
    for f in files:
        process_file(f, out_dir)
        
    print("Processing complete.")

if __name__ == "__main__":
    main()
