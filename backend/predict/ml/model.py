import torch.nn as nn


class DeepEstimatorNet(nn.Module):
    def __init__(self):
        super(DeepEstimatorNet, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(7, 64),  # Simplificado para estabilidade
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 3),
            nn.Sigmoid()  # Restaurado para normalização
        )
        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.layers:
            if isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight)  # Xavier para Sigmoid
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)

    def forward(self, x):
        return self.layers(x)
