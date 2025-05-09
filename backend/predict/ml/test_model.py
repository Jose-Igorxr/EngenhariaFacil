import torch
import pandas as pd
import os
import pickle
from model import DeepEstimatorNet


def load_model():
    model = DeepEstimatorNet()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'best_model.pth')
    model.load_state_dict(torch.load(model_path))
    model.eval()
    return model, script_dir


def predict(area):
    model, script_dir = load_model()
    # Carregar scalers
    with open(os.path.join(script_dir, 'scaler_X.pkl'), 'rb') as f:
        scaler_X = pickle.load(f)
    with open(os.path.join(script_dir, 'scaler_y.pkl'), 'rb') as f:
        scaler_y = pickle.load(f)

    # Normalizar entrada
    input_tensor = torch.tensor([[area]], dtype=torch.float32)
    input_scaled = scaler_X.transform(input_tensor.numpy())
    input_tensor = torch.tensor(input_scaled, dtype=torch.float32)

    # Prever
    with torch.no_grad():
        output_scaled = model(input_tensor).numpy()
        output = scaler_y.inverse_transform(output_scaled)[0]

    return {
        'area': area,
        'cimento': round(output[0], 2),
        'areia': round(output[1], 2),
        'tijolos': round(output[2])
    }


if __name__ == "__main__":
    # Áreas de teste
    areas = [10, 50, 100, 150, 200, 300, 400, 500, 600]
    results = []
    for area in areas:
        r = predict(area)
        results.append(r)

    # Criar tabela com pandas
    df = pd.DataFrame(results)
    df['cimento'] = df['cimento'].map("{:.2f} kg".format)
    df['areia'] = df['areia'].map("{:.2f} kg".format)
    df['tijolos'] = df['tijolos'].map("{:.0f} unidades".format)
    df['area'] = df['area'].map("{:.0f} m²".format)

    print("\nPrevisões do Modelo:")
    print(df.to_string(index=False))
