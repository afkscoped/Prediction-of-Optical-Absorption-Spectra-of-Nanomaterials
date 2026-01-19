import streamlit as st
import requests
import json
import os
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Config
API_URL = "http://localhost:8000"
st.set_page_config(page_title="NanoOptics Eval Dashboard", layout="wide")

st.title("🔬 NanoOptics Evaluation Dashboard")

# --- Sidebar: Controls ---
st.sidebar.header("Configuration")

# Fetch models
try:
    resp = requests.get(f"{API_URL}/models")
    if resp.ok:
        models_data = resp.json()["models"]
        model_names = [m["model_name"] for m in models_data]
    else:
        st.sidebar.error("Failed to fetch models")
        model_names = []
except:
    st.sidebar.warning("Backend not reachable")
    model_names = []

selected_models = st.sidebar.multiselect("Select Models to Compare", model_names, default=model_names)

data_path = st.sidebar.text_input("Data Directory", "data/experimental")
peak_tol = st.sidebar.slider("Peak Tolerance (nm)", 1, 20, 5)

if st.sidebar.button("Run Evaluation"):
    if not selected_models:
        st.error("Select at least one model")
    else:
        with st.spinner("Running evaluation... (this may take a while)"):
            payload = {
                "models": selected_models,
                "data_path": data_path,
                "peak_tol": peak_tol
            }
            try:
                resp = requests.post(f"{API_URL}/eval/run", json=payload, timeout=600)
                if resp.ok:
                    data = resp.json()
                    st.session_state["last_run"] = data
                    st.success("Evaluation Complete!")
                else:
                    st.error(f"Evaluation failed: {resp.text}")
            except Exception as e:
                st.error(f"Error: {e}")

# --- Main Results ---
if "last_run" in st.session_state:
    run = st.session_state["last_run"]
    summary = run.get("summary", {})
    
    st.markdown(f"### Run ID: `{run['run_id']}`")
    
    # 1. Metrics Table
    st.subheader("Aggregate Metrics")
    
    if "models" in summary and summary["models"]:
        # Flatten dict for dataframe
        rows = []
        for m, stats in summary["models"].items():
            if isinstance(stats, dict):
                row = {"Model": m}
                row.update(stats)
                rows.append(row)
            else:
                rows.append({"Model": m, "Status": stats})
        
        df_stats = pd.DataFrame(rows)
        st.dataframe(df_stats.style.highlight_max(axis=0))
    else:
        st.info("No stats available (check if ground truth existed)")

    # 2. Detailed Analysis
    # Load per-sample results if available
    results_csv = os.path.join(run["outdir"], "results_per_sample.csv")
    if os.path.exists(results_csv):
        df_res = pd.read_csv(results_csv)
        
        st.subheader("Per-Sample Analysis")
        
        # Interactive Scatter: Pred Peak vs True Peak
        fig = make_subplots(rows=1, cols=2, subplot_titles=("Peak Parity", "Peak Error Dist."))
        
        for m in selected_models:
            m_df = df_res[df_res.model_name == m]
            if m_df.empty or "true_peak_nm" not in m_df: continue
            
            # Parity
            fig.add_trace(
                go.Scatter(x=m_df["true_peak_nm"], y=m_df["pred_peak_nm"], mode='markers', name=f"{m} (Parity)"),
                row=1, col=1
            )
            
            # Error Hist
            fig.add_trace(
                go.Histogram(x=m_df["peak_error_nm"], name=f"{m} (Error)"),
                row=1, col=2
            )

        # Ideal line
        min_p = df_res["true_peak_nm"].min()
        max_p = df_res["true_peak_nm"].max()
        if not pd.isna(min_p):
            fig.add_trace(go.Scatter(x=[min_p, max_p], y=[min_p, max_p], mode='lines', name='Ideal', line=dict(dash='dash', color='gray')), row=1, col=1)
            
        st.plotly_chart(fig, use_container_width=True)
        
        # 3. Sample Inspector
        st.subheader("Sample Inspector")
        sample_ids = df_res["sample_id"].unique()
        sel_sample = st.selectbox("Select Sample", sample_ids)
        
        col1, col2 = st.columns(2)
        
        # Show image
        sample_row = df_res[df_res.sample_id == sel_sample].iloc[0]
        img_path = sample_row["image_path"]
        if os.path.exists(img_path):
            col1.image(img_path, caption=sel_sample, use_container_width=True)
        
        # Show Spectrum Overlay
        # Need to load predictions from CSVs
        fig_spec = go.Figure()
        
        # Try to load prediction CSVs
        for m in selected_models:
            pred_file = os.path.join(run["outdir"], "predictions", f"{m}_{sel_sample}.csv")
            if os.path.exists(pred_file):
                pdf = pd.read_csv(pred_file)
                fig_spec.add_trace(go.Scatter(x=pdf["wavelength"], y=pdf["prediction"], mode='lines', name=f"{m} Pred"))
        
        col2.plotly_chart(fig_spec, use_container_width=True)

    else:
        st.warning("Per-sample CSV not found. Ensure evaluation ran correctly.")

else:
    st.info("Select models and run evaluation to see results.")
