import pandas as pd
import numpy as np
import os


def generate_dataset():
    # Configurações
    num_samples = 10_000_000
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, 'dataset.csv')

    # Gerar áreas (30% entre 1–10 m², 30% entre 10–50 m², 40% entre 50–500 m²)
    np.random.seed(42)
    samples_small = int(num_samples * 0.3)
    samples_mid = int(num_samples * 0.3)
    samples_large = num_samples - samples_small - samples_mid

    areas_small = np.exp(np.random.uniform(
        np.log(1),   np.log(10),  samples_small)).round(1)
    areas_mid = np.exp(np.random.uniform(
        np.log(10),  np.log(50),  samples_mid)).round(1)
    areas_large = np.exp(np.random.uniform(
        np.log(50),  np.log(500), samples_large)).round(1)
    areas = np.concatenate([areas_small, areas_mid, areas_large])

    cement = np.zeros(num_samples)
    sand = np.zeros(num_samples)
    bricks = np.zeros(num_samples)

    for i in range(num_samples):
        area = areas[i]

        # Cimento: 8 kg/m² ±5%
        cement[i] = 8.0 * area * np.random.uniform(0.95, 1.05)

        # Areia: 20 kg/m² ±5%
        sand[i] = 20.0 * area * np.random.uniform(0.95, 1.05)

        # Tijolos: 14 un/m² ± variação ajustada
        base = 14.0 * area
        if area < 10:
            # variação mais restrita em pequenas áreas ±10%
            var = np.random.uniform(0.90, 1.10)
        elif area < 50:
            var = np.random.uniform(0.90, 1.10)
        else:
            # em áreas grandes seguimos ±8%
            var = np.random.uniform(0.92, 1.08)
        bricks[i] = base * var

    # Garantir não negativos e arredondar
    cement = np.clip(cement, 0, None).round(1)
    sand = np.clip(sand,   0, None).round(1)
    bricks = np.clip(bricks, 0, None).round(0)

    df = pd.DataFrame({
        'area':   areas,
        'cimento': cement,
        'areia':  sand,
        'tijolos': bricks
    })

    print("Estatísticas do dataset:")
    print(df.describe())

    df.to_csv(dataset_path, index=False)
    print(f"Dataset gerado com {num_samples} entradas em: {dataset_path}")


if __name__ == "__main__":
    generate_dataset()
