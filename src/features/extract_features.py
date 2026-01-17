import cv2, os, numpy as np, pandas as pd
from glob import glob
from tqdm import tqdm

# ---------- Image Loader ----------
def load_gray(path):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        return None

    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Convert 16-bit to 8-bit if needed
    if img.dtype == np.uint16:
        img = (img / 65535.0 * 255).astype(np.uint8)

    return img

# ---------- Process One Image ----------
def process_image(path, debug=False):
    img = load_gray(path)
    if img is None:
        return None, None

    img = cv2.resize(img, (512, 512))

    blur = cv2.GaussianBlur(img, (5,5), 0)

    # For TEM: particles are dark → invert Otsu
    _, th = cv2.threshold(
        blur, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    kernel = np.ones((3,3), np.uint8)
    th = cv2.morphologyEx(th, cv2.MORPH_OPEN, kernel, iterations=1)

    cnts, _ = cv2.findContours(
        th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    areas = []
    aspect_ratios = []

    vis = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    for c in cnts:
        a = cv2.contourArea(c)
        if a > 20:  # small noise filter
            areas.append(a)
            x,y,w,h = cv2.boundingRect(c)
            if h > 0:
                aspect_ratios.append(w / h)
            else:
                aspect_ratios.append(1.0)

            if debug:
                cv2.drawContours(vis, [c], -1, (0,0,255), 1)

    if len(areas) == 0:
        return None, vis

    areas = np.array(areas)
    eq_diam = np.sqrt(4 * areas / np.pi)

    features = {
        "mean_diam_px": float(eq_diam.mean()),
        "std_diam_px": float(eq_diam.std()),
        "particle_count": int(len(eq_diam)),
        "mean_aspect": float(np.mean(aspect_ratios))
    }

    return features, vis

# ---------- Collect All Images ----------
img_paths = []
for ext in ["png","jpg","jpeg","tif","tiff","bmp"]:
    img_paths += glob(f"data/subset/**/*.{ext}", recursive=True)

print("Found images:", len(img_paths))

# ---------- Debug first few ----------
os.makedirs("outputs/debug", exist_ok=True)

print("Running debug on first 5 images...")

for i, p in enumerate(img_paths[:5]):
    feats, vis = process_image(p, debug=True)
    if vis is not None:
        out = os.path.join("outputs/debug", f"debug_{i}.png")
        cv2.imwrite(out, vis)
        print("Saved debug:", out)

print("Now processing full dataset...")

rows = []
for p in tqdm(img_paths):
    feats, _ = process_image(p, debug=False)
    if feats is None:
        continue
    feats["image_path"] = p
    rows.append(feats)

df = pd.DataFrame(rows)
os.makedirs("data/processed", exist_ok=True)
df.to_csv("data/processed/morphology_features.csv", index=False)

print("Saved features for", len(df), "images")
