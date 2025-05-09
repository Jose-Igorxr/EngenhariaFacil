import torch
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset
from datetime import datetime
import os
from model import DeepEstimatorNet
import pickle


def train():
    # Configurações
    config = {
        'batch_size': 512,
        'lr': 0.001,  # Restaurado para aprendizado mais rápido
        'epochs': 100,
        'patience': 50,
        'lr_factor': 0.1,
        'lr_patience': 5,
        'val_split': 0.2,
        'weight_decay': 1e-3,  # Reduzido para evitar supressão
        'clip_value': 1.0,
        'ratio_lambda': 0.5,
        'scale_penalty': 0.2  # Aumentado para forçar >0.5
    }

    # Diretórios
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, 'data')
    imagens_dir = os.path.join(data_dir, 'imagens')
    pkl_dir = os.path.join(data_dir, 'pkl')
    logs_dir = os.path.join(data_dir, 'logs')
    models_dir = os.path.join(data_dir, 'models')
    for d in [data_dir, imagens_dir, pkl_dir, logs_dir, models_dir]:
        os.makedirs(d, exist_ok=True)

    dataset_path = os.path.join(script_dir, 'dataset.csv')
    best_model_path = os.path.join(models_dir, 'best_model.pth')
    log_path = os.path.join(logs_dir, 'training_log.csv')

    # Dados
    df = pd.read_csv(dataset_path)
    construction_type_dummies = pd.get_dummies(
        df['construction_type'], prefix='construction')
    region_dummies = pd.get_dummies(df['region'], prefix='region')
    X = pd.concat([df[['area']], construction_type_dummies,
                  region_dummies], axis=1).values.astype('float32')
    y = df[['cimento', 'areia', 'tijolos']].values.astype('float32')

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y)

    X_train, X_val, y_train, y_val = train_test_split(
        X_scaled, y_scaled, test_size=config['val_split'], random_state=42)

    train_ds = TensorDataset(torch.tensor(X_train), torch.tensor(y_train))
    val_ds = TensorDataset(torch.tensor(X_val), torch.tensor(y_val))

    train_dl = DataLoader(
        train_ds, batch_size=config['batch_size'], shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=config['batch_size'], shuffle=False)

    model = DeepEstimatorNet()
    loss_fn = torch.nn.SmoothL1Loss()
    optimizer = torch.optim.Adam(
        model.parameters(), lr=config['lr'], weight_decay=config['weight_decay'])
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=config['lr_factor'], patience=config['lr_patience'])

    train_losses, val_losses = [], []
    train_ratios, val_ratios = [], []
    train_cement, train_sand, train_bricks = [], [], []
    val_cement, val_sand, val_bricks = [], [], []
    best_val_loss = float('inf')
    patience_counter = 0

    with open(log_path, 'w') as f:
        f.write('epoch,train_loss,val_loss,train_ratio,val_ratio,train_cement,train_sand,train_bricks,val_cement,val_sand,val_bricks\n')

    plt.ion()
    fig, axs = plt.subplots(3, 1, figsize=(12, 12))

    for epoch in range(config['epochs']):
        model.train()
        train_loss = 0.0
        train_ratio_sum = 0.0
        train_cement_sum = 0.0
        train_sand_sum = 0.0
        train_bricks_sum = 0.0
        train_batches = 0

        for xb, yb in train_dl:
            pred = model(xb)
            pred = torch.clamp(pred, 0.0, 1.0)
            cement = pred[:, 0]
            sand = pred[:, 1]
            mse_loss = loss_fn(pred, yb) * \
                torch.tensor([4.0, 3.0, 5.0])  # Ajustado pesos
            mse_loss = mse_loss.mean()
            ratio_loss = config['ratio_lambda'] * \
                torch.mean(torch.abs(sand / (cement + 1e-8) - 1.0))
            scale_penalty = config['scale_penalty'] * \
                torch.mean(torch.relu(0.5 - pred))  # Penaliza <0.5
            sand_penalty = config['scale_penalty'] * \
                torch.mean(torch.relu(0.1 - sand))  # Força areia >0
            loss = mse_loss + ratio_loss + scale_penalty + sand_penalty
            loss.backward()
            torch.nn.utils.clip_grad_value_(
                model.parameters(), config['clip_value'])
            optimizer.step()
            optimizer.zero_grad()
            train_loss += loss.item()
            train_ratio_sum += (sand / (cement + 1e-8)).mean().item()
            train_cement_sum += cement.mean().item()
            train_sand_sum += sand.mean().item()
            train_bricks_sum += pred[:, 2].mean().item()
            train_batches += 1

        train_loss /= train_batches
        train_ratio = train_ratio_sum / train_batches
        train_cement_avg = train_cement_sum / train_batches
        train_sand_avg = train_sand_sum / train_batches
        train_bricks_avg = train_bricks_sum / train_batches
        train_losses.append(train_loss)
        train_ratios.append(train_ratio)
        train_cement.append(train_cement_avg)
        train_sand.append(train_sand_avg)
        train_bricks.append(train_bricks_avg)

        model.eval()
        val_loss = 0.0
        val_ratio_sum = 0.0
        val_cement_sum = 0.0
        val_sand_sum = 0.0
        val_bricks_sum = 0.0
        val_batches = 0

        with torch.no_grad():
            for xb, yb in val_dl:
                pred = model(xb)
                pred = torch.clamp(pred, 0.0, 1.0)
                cement = pred[:, 0]
                sand = pred[:, 1]
                mse_loss = loss_fn(pred, yb) * torch.tensor([4.0, 3.0, 5.0])
                mse_loss = mse_loss.mean()
                ratio_loss = config['ratio_lambda'] * \
                    torch.mean(torch.abs(sand / (cement + 1e-8) - 1.0))
                scale_penalty = config['scale_penalty'] * \
                    torch.mean(torch.relu(0.5 - pred))
                sand_penalty = config['scale_penalty'] * \
                    torch.mean(torch.relu(0.1 - sand))
                loss = mse_loss + ratio_loss + scale_penalty + sand_penalty
                val_loss += loss.item()
                val_ratio_sum += (sand / (cement + 1e-8)).mean().item()
                val_cement_sum += cement.mean().item()
                val_sand_sum += sand.mean().item()
                val_bricks_sum += pred[:, 2].mean().item()
                val_batches += 1

        val_loss /= val_batches
        val_ratio = val_ratio_sum / val_batches
        val_cement_avg = val_cement_sum / val_batches
        val_sand_avg = val_sand_sum / val_batches
        val_bricks_avg = val_bricks_sum / val_batches
        val_losses.append(val_loss)
        val_ratios.append(val_ratio)
        val_cement.append(val_cement_avg)
        val_sand.append(val_sand_avg)
        val_bricks.append(val_bricks_avg)

        print(f"Epoch {epoch+1}/{config['epochs']} - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}, "
              f"Train Ratio: {train_ratio:.2f}, Val Ratio: {val_ratio:.2f}, "
              f"Train Cement: {train_cement_avg:.2f}, Train Sand: {train_sand_avg:.2f}, Train Bricks: {train_bricks_avg:.2f}, "
              f"Val Cement: {val_cement_avg:.2f}, Val Sand: {val_sand_avg:.2f}, Val Bricks: {val_bricks_avg:.2f}")
        with open(log_path, 'a') as f:
            f.write(f"{epoch+1},{train_loss:.4f},{val_loss:.4f},{train_ratio:.2f},{val_ratio:.2f},"
                    f"{train_cement_avg:.2f},{train_sand_avg:.2f},{train_bricks_avg:.2f},"
                    f"{val_cement_avg:.2f},{val_sand_avg:.2f},{val_bricks_avg:.2f}\n")

        scheduler.step(val_loss)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            patience_counter += 1

        if patience_counter >= config['patience']:
            print(f"Early stopping na época {epoch+1}")
            break

        axs[0].cla()
        axs[1].cla()
        axs[2].cla()
        axs[0].plot(train_losses, label='Train Loss', color='blue')
        axs[0].plot(val_losses, label='Val Loss', color='orange')
        axs[0].axhline(y=0.0, color='green', linestyle='--',
                       label='Ideal Loss (0.0)')
        axs[0].set_title("Perda do Treinamento")
        axs[0].legend()
        axs[0].grid(True)
        axs[1].plot(train_ratios, label='Train Ratio', color='blue')
        axs[1].plot(val_ratios, label='Val Ratio', color='orange')
        axs[1].axhline(y=1.0, color='green', linestyle='--',
                       label='Ideal Ratio (1.0)')
        axs[1].set_title("Proporção Areia/Cimento (Normalizada)")
        axs[1].legend()
        axs[1].grid(True)
        axs[2].plot(train_bricks, label='Train Bricks', color='blue')
        axs[2].plot(val_bricks, label='Val Bricks', color='orange')
        axs[2].axhline(y=0.5, color='green', linestyle='--',
                       label='Ideal Bricks (0.5)')
        axs[2].set_title("Previsão de Tijolos")
        axs[2].legend()
        axs[2].grid(True)

        plt.tight_layout()
        plt.draw()
        plt.pause(0.01)

    print("Modelo treinado. Melhor modelo salvo em:", best_model_path)
    model.load_state_dict(torch.load(best_model_path))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    plt.savefig(os.path.join(
        imagens_dir, f"training_plot_{timestamp}.png"), dpi=150)
    plt.ioff()
    plt.show()

    with open(os.path.join(pkl_dir, 'scaler_X.pkl'), 'wb') as f:
        pickle.dump(scaler_X, f)
    with open(os.path.join(pkl_dir, 'scaler_y.pkl'), 'wb') as f:
        pickle.dump(scaler_y, f)


if __name__ == "__main__":
    train()
