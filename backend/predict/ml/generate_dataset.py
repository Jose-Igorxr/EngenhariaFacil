import pandas as pd
import numpy as np
import os


def generate_dataset():
    # Configurações
    num_samples = 100_000
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, 'dataset.csv')

    # Gerar áreas
    np.random.seed(42)
    areas = np.random.exponential(
        scale=100, size=num_samples).clip(1, 500).round(1)

    # Tipos de construção e regiões
    construction_types = np.random.choice(
        ['residential', 'commercial', 'industrial'], size=num_samples, p=[0.6, 0.3, 0.1])
    regions = np.random.choice(
        ['urban', 'suburban', 'rural'], size=num_samples, p=[0.5, 0.3, 0.2])

    # Fatores de ajuste
    cement_factors = {'residential': 1.0,
                      'commercial': 1.05, 'industrial': 1.1}
    sand_factors = {'residential': 1.0, 'commercial': 1.0, 'industrial': 1.05}
    brick_factors = {
        'urban': {'residential': 1.0, 'commercial': 1.2, 'industrial': 1.5},
        'suburban': {'residential': 0.95, 'commercial': 1.15, 'industrial': 1.4},
        'rural': {'residential': 0.9, 'commercial': 1.1, 'industrial': 1.3}
    }

    # Gerar dados
    cement = np.zeros(num_samples)
    sand = np.zeros(num_samples)
    bricks = np.zeros(num_samples)

    for i in range(num_samples):
        area = areas[i]
        c_type = construction_types[i]
        region = regions[i]

        # Cimento: 0.2 kg/m² ±10%
        cement_base = 0.2 * area * cement_factors[c_type]
        cement[i] = cement_base * np.random.uniform(0.9, 1.1)

        # Areia: 0.6 kg/m² ±20%
        sand_base = 0.6 * area * sand_factors[c_type]
        # Aumentada variabilidade
        sand[i] = sand_base * np.random.uniform(0.8, 1.2)

        # Tijolos: 62.5/m² ±10%, normalizado por 1000
        bricks_base = 62.5 * area * brick_factors[region][c_type]
        bricks[i] = bricks_base * np.random.uniform(0.9, 1.1) / 1000

    # Garantir valores não negativos e arredondar
    cement = np.clip(cement, 0, None).round(1)
    sand = np.clip(sand, 0, None).round(1)
    bricks = np.clip(bricks, 0, None).round(3)

    # Criar DataFrame
    data = {
        'area': areas,
        'construction_type': construction_types,
        'region': regions,
        'cimento': cement,
        'areia': sand,
        'tijolos': bricks
    }
    df = pd.DataFrame(data)

    # Salvando o dataset
    df.to_csv(dataset_path, index=False)
    print(f"Dataset gerado com {num_samples} entradas em: {dataset_path}")


if __name__ == "__main__":
    generate_dataset()
