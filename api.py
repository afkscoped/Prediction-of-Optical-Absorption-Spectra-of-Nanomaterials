import os
import cv2
import numpy as np
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from predict import model, X_mean, X_std, wavelengths, extract_features

app = FastAPI(title="NanoOptics Prediction API")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp_filename = ""
    try:
        # Save uploaded file temporarily because extract_features expects a path
        contents = await file.read()
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as f:
            f.write(contents)
            
        try:
            feats = extract_features(temp_filename)
        except Exception as e:
             raise HTTPException(status_code=400, detail=f"Feature extraction failed: {str(e)}")

        # Normalize
        feats_norm = (feats - X_mean) / X_std

        # Predict
        with torch.no_grad():
            pred = model(torch.tensor(feats_norm).unsqueeze(0)).numpy()[0]
        
        # Calculate Peak and simple FWHM
        peak_idx = np.argmax(pred)
        peak_wavelength = float(wavelengths[peak_idx])
        max_val = pred[peak_idx]
        half_max = max_val / 2.0
        
        # Simple FWHM estimation
        indices = np.where(pred > half_max)[0]
        if len(indices) > 0:
            fwhm = float(wavelengths[indices[-1]] - wavelengths[indices[0]])
        else:
            fwhm = 0.0

        return {
            "wavelengths": wavelengths.tolist(),
            "spectrum": pred.tolist(),
            "peak": peak_wavelength,
            "fwhm": fwhm,
            "features": {
                "mean_diameter": float(feats[0]),
                "std_diameter": float(feats[1]),
                "count": int(feats[2]),
                "aspect_ratio": float(feats[3])
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
