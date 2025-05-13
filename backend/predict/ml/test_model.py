from predict import predict
import pandas as pd
import numpy as np
import sys
import os

# Adicionar o diretório ml ao sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def test_model():
    # Áreas para teste
    test_areas = [1, 50, 100, 200, 500]

    # Previsões
    results = []
    for area in test_areas:
        pred = predict(area)
        results.append({
            'area': area,
            'cimento': pred['cimento'],
            'areia': pred['areia'],
            'tijolos': pred['tijolos'],
            'cimento_m2': pred['cimento'] / area,
            'areia_m2': pred['areia'] / area,
            'tijolos_m2': pred['tijolos'] / area,
        })

    # Criar DataFrame
    df = pd.DataFrame(results)
    df['tijolos'] = df['tijolos'].astype(int)
    df = df[['area', 'cimento', 'areia', 'tijolos',
             'cimento_m2', 'areia_m2', 'tijolos_m2']]
    df.columns = ['area', 'cimento', 'areia', 'tijolos',
                  'cimento_m2', 'areia_m2', 'tijolos_m2']

    # Formatando para exibição
    df_display = df.copy()
    df_display['area'] = df_display['area'].apply(lambda x: f"{x} m²")
    df_display['cimento'] = df_display['cimento'].apply(
        lambda x: f"{x:.1f} kg")
    df_display['areia'] = df_display['areia'].apply(lambda x: f"{x:.1f} kg")
    df_display['tijolos'] = df_display['tijolos'].apply(lambda x: f"{x} un")
    df_display['cimento_m2'] = df_display['cimento_m2'].apply(
        lambda x: f"{x:.3f}")
    df_display['areia_m2'] = df_display['areia_m2'].apply(lambda x: f"{x:.3f}")
    df_display['tijolos_m2'] = df_display['tijolos_m2'].apply(
        lambda x: f"{x:.1f}")

    print("\nPrevisões do Modelo:")
    print(df_display.to_string(index=False))


if __name__ == "__main__":
    test_model()
