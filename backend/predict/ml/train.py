import torch
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset
import os
import pickle
from model import DeepEstimatorNet


def train():
    # Configurações
    config = {
        'batch_size': 256,
        'lr': 0.003,
        'epochs': 200,
        'patience': 10,  # Aumentado para mais aprendizado
        'val_split': 0.2,
        'weight_decay': 1e-5,
    }

    # Diretórios
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, 'data')
    models_dir = os.path.join(data_dir, 'models')
    pkl_dir = os.path.join(data_dir, 'pkl')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(pkl_dir, exist_ok=True)

    dataset_path = os.path.join(script_dir, 'dataset.csv')
    best_model_path = os.path.join(models_dir, 'best_model.pth')

    # Dados
    df = pd.read_csv(dataset_path)
    X = df[['area']].values.astype('float32')
    y = df[['cimento', 'areia', 'tijolos']].values.astype('float32')

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y)

    # Verificar escalonamento
    print("X_scaled min:", X_scaled.min(), "max:", X_scaled.max())
    print("y_scaled min:", y_scaled.min(axis=0), "max:", y_scaled.max(axis=0))

    X_train, X_val, y_train, y_val = train_test_split(
        X_scaled, y_scaled, test_size=config['val_split'], random_state=42)

    train_ds = TensorDataset(torch.tensor(X_train), torch.tensor(y_train))
    val_ds = TensorDataset(torch.tensor(X_val), torch.tensor(y_val))
    train_dl = DataLoader(
        train_ds, batch_size=config['batch_size'], shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=config['batch_size'], shuffle=False)

    # Modelo
    model = DeepEstimatorNet()
    loss_fn = torch.nn.SmoothL1Loss()
    optimizer = torch.optim.Adam(
        model.parameters(), lr=config['lr'], weight_decay=config['weight_decay'])

    best_val_loss = float('inf')
    patience_counter = 0

    for epoch in range(config['epochs']):
        model.train()
        train_loss = 0.0
        for xb, yb in train_dl:
            pred = model(xb)
            loss = loss_fn(pred, yb)
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
            train_loss += loss.item()
        train_loss /= len(train_dl)

        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for xb, yb in val_dl:
                pred = model(xb)
                val_loss += loss_fn(pred, yb).item()
            val_loss /= len(val_dl)

        print(
            f"Epoch {epoch+1}/{config['epochs']} - Train Loss: {train_loss:.6f}, Val Loss: {val_loss:.6f}")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            patience_counter += 1
            if patience_counter >= config['patience']:
                print(f"Early stopping na época {epoch+1}")
                break

    print("Modelo treinado. Melhor modelo salvo em:", best_model_path)
    with open(os.path.join(pkl_dir, 'scaler_X.pkl'), 'wb') as f:
        pickle.dump(scaler_X, f)
    with open(os.path.join(pkl_dir, 'scaler_y.pkl'), 'wb') as f:
        pickle.dump(scaler_y, f)


if __name__ == "__main__":
    train()
