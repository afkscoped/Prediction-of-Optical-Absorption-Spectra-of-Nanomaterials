import pandas as pd
import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset, random_split
import lightning as L
from src.training.lightning_module import LitSpectrum

# Load data
df = pd.read_csv("data/processed/morphology_features.csv")

X = df[["mean_diam_px","std_diam_px","particle_count","mean_aspect"]].values.astype("float32")
Y = np.load("data/processed/spectra.npy").astype("float32")

# Normalize inputs (important)
X_mean = X.mean(axis=0)
X_std = X.std(axis=0) + 1e-8
X = (X - X_mean) / X_std

# Save normalization params
np.save("data/processed/X_mean.npy", X_mean)
np.save("data/processed/X_std.npy", X_std)

X = torch.tensor(X)
Y = torch.tensor(Y)

dataset = TensorDataset(X, Y)

# Split
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_ds, val_ds = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=32)

# Model
model = LitSpectrum(in_dim=X.shape[1])

# Trainer
trainer = L.Trainer(
    max_epochs=300,
    accelerator="auto",
    devices="auto"
)

trainer.fit(model, train_loader, val_loader)

# Save final model
torch.save(model.model.state_dict(), "outputs/spectrum_mlp.pth")
print("Saved model to outputs/spectrum_mlp.pth")
