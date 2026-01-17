import lightning as L
import torch
import torch.nn.functional as F
from src.models.mlp import SpectrumMLP

class LitSpectrum(L.LightningModule):
    def __init__(self, in_dim):
        super().__init__()
        self.model = SpectrumMLP(in_dim)

    def forward(self, x):
        return self.model(x)

    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.mse_loss(y_hat, y)
        self.log("train_loss", loss, prog_bar=True)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.mse_loss(y_hat, y)
        self.log("val_loss", loss, prog_bar=True)

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)
