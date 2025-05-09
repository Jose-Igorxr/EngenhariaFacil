import torch
import pandas as pd
import os
import pickle
from .model import DeepEstimatorNet


def load_model():
    model = DeepEstimatorNet()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'data', 'models', 'best_model.pth')
    model.load_state_dict(torch.load(model_path))
    model.eval()
    return model, script_dir


def predict(area, construction_type, region):
    model, script_dir = load_model()
    # Carregar scalers
    with open(os.path.join(script_dir, 'data', 'pkl', 'scaler_X.pkl'), 'rb') as f:
        scaler_X = pickle.load(f)
    with open(os.path.join(script_dir, 'data', 'pkl', 'scaler_y.pkl'), 'rb') as f:
        scaler_y = pickle.load(f)

    # Codificar variáveis categóricas
    construction_types = ['residential', 'commercial', 'industrial']
    regions = ['urban', 'suburban', 'rural']
    construction_dummy = [1 if construction_type ==
                          ct else 0 for ct in construction_types]
    region_dummy = [1 if region == r else 0 for r in regions]
    input_data = [[area] + construction_dummy + region_dummy]

    # Normalizar entrada
    input_scaled = scaler_X.transform(input_data)
    input_tensor = torch.tensor(input_scaled, dtype=torch.float32)

    # Prever
    with torch.no_grad():
        output_scaled = model(input_tensor).numpy()
        output_original = scaler_y.inverse_transform(output_scaled)[0]

    # Pós-processamento para garantir proporção areia/cimento ~3.0
    cement_orig, sand_orig, bricks_orig = output_original
    total_mass = cement_orig + sand_orig
    cement_adjusted = total_mass / (1 + 3)
    sand_adjusted = 3 * cement_adjusted

    return {
        'area': area,
        'construction_type': construction_type,
        'region': region,
        'cimento': round(cement_adjusted, 2),
        'areia': round(sand_adjusted, 2),
        'tijolos': round(bricks_orig)
    }


if __name__ == "__main__":
    # Casos de teste
    test_cases = [
        {'area': 10, 'construction_type': 'residential', 'region': 'urban'},
        {'area': 50, 'construction_type': 'residential', 'region': 'suburban'},
        {'area': 100, 'construction_type': 'commercial', 'region': 'urban'},
        {'area': 150, 'construction_type': 'commercial', 'region': 'rural'},
        {'area': 200, 'construction_type': 'industrial', 'region': 'urban'},
        {'area': 300, 'construction_type': 'industrial', 'region': 'suburban'},
        {'area': 400, 'construction_type': 'residential', 'region': 'rural'},
        {'area': 500, 'construction_type': 'commercial', 'region': 'urban'},
        {'area': 600, 'construction_type': 'industrial', 'region': 'rural'}
    ]

    results = [predict(**case) for case in test_cases]

    # Criar tabela com pandas
    df = pd.DataFrame(results)
    df['area'] = df['area'].map("{:.0f} m²".format)
    df['cimento'] = df['cimento'].map("{:.2f} kg".format)
    df['areia'] = df['areia'].map("{:.2f} kg".format)
    df['tijolos'] = df['tijolos'].map("{:.0f} unidades".format)

    print("\nPrevisões do Modelo:")
    print(df.to_string(index=False))
