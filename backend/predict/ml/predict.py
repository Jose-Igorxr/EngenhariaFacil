import torch
import numpy as np
import pickle
import os
from .model import DeepEstimatorNet


def predict(area):
    # Caminhos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, 'data', 'models')
    pkl_dir = os.path.join(script_dir, 'data', 'pkl')
    model_path = os.path.join(models_dir, 'best_model.pth')
    scaler_X_path = os.path.join(pkl_dir, 'scaler_X.pkl')
    scaler_y_path = os.path.join(pkl_dir, 'scaler_y.pkl')

    # Carregar escalonadores
    with open(scaler_X_path, 'rb') as f:
        scaler_X = pickle.load(f)
    with open(scaler_y_path, 'rb') as f:
        scaler_y = pickle.load(f)

    # Preparar entrada
    X = np.array([[area]], dtype=np.float32)
    X_scaled = scaler_X.transform(X)

    # Carregar modelo
    model = DeepEstimatorNet()
    model.load_state_dict(torch.load(model_path))
    model.eval()

    # Previsão
    with torch.no_grad():
        X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
        pred_scaled = model(X_tensor).numpy()
        pred = scaler_y.inverse_transform(pred_scaled)

    # Garantir valores mínimos realistas
    min_cement = 8.0 * area  # 8 kg/m²
    min_sand = 20.0 * area   # 20 kg/m²
    min_bricks = 14.0 * area  # 14 un/m²
    pred[0, 0] = max(pred[0, 0], min_cement)
    pred[0, 1] = max(pred[0, 1], min_sand)
    pred[0, 2] = max(pred[0, 2], min_bricks)

    # Garantir não negativos
    pred = np.clip(pred, 0, None)

    # Resultados
    return {
        'cimento': float(pred[0, 0]),
        'areia': float(pred[0, 1]),
        'tijolos': int(round(pred[0, 2])),
    }
