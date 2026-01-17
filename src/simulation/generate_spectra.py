import numpy as np
import pandas as pd
import miepython

# Wavelengths: 300–800 nm, step 2 nm
wavelengths = np.arange(300, 801, 2)  # 251 points

# Rough optical constants for carbon/diamond-like material
n_particle = 2.4
k_particle = 0.05
n_medium = 1.33

def simulate_spectrum(d_nm):
    """
    Compute extinction efficiency spectrum using miepython v3 API
    """
    m = complex(n_particle, k_particle)

    qext_list = []

    for wl in wavelengths:
        # miepython v3 expects:
        # efficiencies(m, diameter, wavelength, n_medium)
        qext, qsca, qback, g = miepython.efficiencies(m, d_nm, wl, n_medium)
        qext_list.append(qext)

    return np.array(qext_list)

print("Loading morphology features...")
df = pd.read_csv("data/processed/morphology_features.csv")

spectra = []

print("Generating spectra...")

for i, row in df.iterrows():
    # TEMPORARY scale: assume 1 pixel = 0.5 nm
    d_nm = row.mean_diam_px * 0.5

    # Avoid zero or insane values
    d_nm = max(d_nm, 1.0)

    spec = simulate_spectrum(d_nm)
    spectra.append(spec)

spectra = np.array(spectra).astype("float32")

# Save
np.save("data/processed/spectra.npy", spectra)
np.save("data/processed/wavelengths.npy", wavelengths)

print("Saved spectra shape:", spectra.shape)
print("Saved wavelengths shape:", wavelengths.shape)
print("Min/Max spectrum values:", spectra.min(), spectra.max())
