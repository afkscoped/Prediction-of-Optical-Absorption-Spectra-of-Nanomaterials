import os
import glob
import json
import subprocess
import threading
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.eval.infer_multi import ModelWrapper

app = FastAPI(title="NanoOptics Prediction API")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Management ---
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models", "registered")
loaded_models = {}

def get_model(model_name: str):
    if model_name in loaded_models:
        return loaded_models[model_name]
    
    # Try to load
    json_path = os.path.join(MODELS_DIR, f"{model_name}.json")
    if not os.path.exists(json_path):
        # Try finding ANY json if name is simple
        pass

    if os.path.exists(json_path):
        with open(json_path) as f:
            meta = json.load(f)
        path = meta["path"]
        if not os.path.isabs(path):
            path = os.path.join(os.path.dirname(__file__), path)
        print(f"Loading model {model_name} from {path}")
        loaded_models[model_name] = ModelWrapper(path)
        return loaded_models[model_name]
    
    raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

# Initialize default model
try:
    if os.path.exists(os.path.join(MODELS_DIR, "final_demo_model.json")):
        get_model("final_demo_model")
    elif os.path.exists(os.path.join(MODELS_DIR, "physics_pretrained.json")):
        get_model("physics_pretrained")
except Exception as e:
    print(f"Error loading default model: {e}")

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/models")
def list_models():
    models = []
    if os.path.exists(MODELS_DIR):
        for f in glob.glob(os.path.join(MODELS_DIR, "*.json")):
            with open(f) as jf:
                models.append(json.load(jf))
    return {"models": models}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...), 
    model: str = Query("final_demo_model", description="Model name to use")
):
    temp_filename = ""
    try:
        wrapper = get_model(model)
        
        contents = await file.read()
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as f:
            f.write(contents)
            
        res = wrapper.predict(image_path=temp_filename)
        
        return {
            "wavelengths": res["wavelengths"].tolist(),
            "spectrum": res["spectrum"].tolist(),
            "peak": res["peak_nm"],
            "fwhm": res["fwhm_nm"],
            "features": {
                "mean_diameter": float(res["features"][0]),
                "std_diameter": float(res["features"][1]),
                "count": int(res["features"][2]),
                "aspect_ratio": float(res["features"][3])
            },
            "model_used": model
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_filename and os.path.exists(temp_filename):
            try: os.remove(temp_filename)
            except: pass

# --- Evaluation Endpoints ---

@app.post("/eval/run")
async def run_evaluation(payload: dict, background_tasks: BackgroundTasks):
    # payload: {models: [], data_path: str, peak_tol: float}
    models = payload.get("models", "all")
    if isinstance(models, list): models = ",".join(models)
    
    data_path = payload.get("data_path", "data/experimental")
    peak_tol = payload.get("peak_tol", 5.0)
    
    run_id = subprocess.check_output(["date", "+%Y%m%d_%H%M%S"], shell=True).decode().strip() if os.name != 'nt' else \
             subprocess.check_output("powershell Get-Date -Format yyyyMMdd_HHmmss", shell=True).decode().strip()
             
    outdir = os.path.join("eval", run_id)
    
    cmd = [
        "python", "src/eval/evaluate_models.py",
        "--models", models,
        "--data", data_path,
        "--outdir", outdir,
        "--peak_tol", str(peak_tol)
    ]
    
    # Run async (blocking here for simplicity or use subprocess.Popen)
    # Using check_output to wait for result in this demo, or Popen for async
    # The prompt asked for "Run evaluation button (calls backend /eval/run)"
    try:
        # For better UX, we should run in background, but user wants response.
        # Let's run synchronously for now as requested "For simplicity, run synchronously"
        
        # Ensure PYTHONPATH includes current directory for module resolution
        env = os.environ.copy()
        if "PYTHONPATH" in env:
            env["PYTHONPATH"] += os.pathsep + os.getcwd()
        else:
            env["PYTHONPATH"] = os.getcwd()
            
        subprocess.check_call(cmd, env=env)
        
        summary_path = os.path.join(outdir, "summary.json")
        if os.path.exists(summary_path):
            with open(summary_path) as f:
                summary = json.load(f)
            return {"status": "success", "run_id": run_id, "summary": summary, "outdir": outdir}
        else:
            return {"status": "completed_no_results", "run_id": run_id}
            
    except subprocess.CalledProcessError as e:
         raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")

@app.get("/eval/report/{run_id}")
def get_report(run_id: str):
    outdir = os.path.join("eval", run_id)
    summary_path = os.path.join(outdir, "summary.json")
    if os.path.exists(summary_path):
        with open(summary_path) as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Run not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
