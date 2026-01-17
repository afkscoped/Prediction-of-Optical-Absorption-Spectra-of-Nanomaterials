# 🧠 NanoOptics: Physics-Guided ML Surrogate for Optical Absorption

This project implements a **physics-guided machine learning surrogate system** to predict optical absorption spectra of nanomaterials from TEM images.

---

## 🔁 The Full Pipeline

```
TEM Image
   ↓
OpenCV-based image processing
   ↓
Particle morphology extraction
   ↓
Physics simulation (Mie/Rayleigh approximation)
   ↓
Pseudo ground-truth absorption spectrum
   ↓
ML model trained to learn:
      morphology → spectrum
```

---

## 🧩 Why This Makes Sense Scientifically

* **TEM image tells us:**
  * Particle size
  * Distribution
  * Count
* **Optical absorption depends mainly on:**
  * Size
  * Material
  * Medium

So:
> Instead of training "image → spectrum" directly (impossible with no data), we train "physics surrogate".

---

## 🧠 What The Model Is Actually Learning

> It is learning to **approximate the Mie physics solver**.

Meaning:
* Slow physics simulation → replaced by fast ML prediction
* For new TEM:
  * We extract size
  * ML predicts spectrum in milliseconds

---

## ⚠️ Important Scientific Honesty

> This predicts **Mie-like theoretical spectra**, not real UV–Vis experiment yet.

To make it real:
> You need paired TEM + UV–Vis data and fine-tuning.

---

# 🏗️ Structure

```
nanooptics/
├── data/
│   ├── raw/         # Original TEM images
│   └── processed/   # Extracted features + generated spectra
├── src/
│   ├── features/    # OpenCV feature extraction
│   ├── simulation/  # Physics (Mie) spectrum generator
│   ├── models/      # Neural network
│   └── training/    # Lightning training code
└── outputs/
```

---

# 🚀 How To Run Everything Locally

## ✅ Step 0 — Install Python
Require: **Python 3.9+**

## ✅ Step 1 — Create Virtual Environment (Recommended)

```bash
python -m venv nano_env
```

Activate:

### Windows:
```bash
nano_env\Scripts\activate
```

### Mac/Linux:
```bash
source nano_env/bin/activate
```

## ✅ Step 2 — Install Dependencies

```bash
pip install -r requirements.txt
```

## ✅ Step 3 — Put Images
Put TEM images in: `data/raw/images/` (Or any subfolder inside `data/raw/`)

## ✅ Step 4 — Extract Morphology Features

```bash
python src/features/extract_features.py
```

## ✅ Step 5 — Generate Physics Spectra

```bash
python src/simulation/generate_spectra.py
```

## ✅ Step 6 — Train ML Model

```bash
python src/training/train.py
```

This will train the model and save checkpoints in `lightning_logs/`.

---

# 🔮 How To Run Prediction On New TEM Image

Run the prediction script:

```bash
python src/predict.py
```

This will:
1. Load the trained model.
2. Extract features from the image specified in `predict.py`.
3. Generate and save the predicted spectrum to `outputs/predicted_spectrum.png`.

---
**Note:** This is a physics-approximation based model.
