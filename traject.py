import pandas as pd
import matplotlib.pyplot as plt

# Чтение данных из файла log.csv
df = pd.read_csv('log.csv')

# Преобразование данных в список кортежей для сортировки
df['timestamp'] = pd.to_numeric(df['timestamp'], errors='coerce')  # Преобразование timestamp в числовой формат
df_sorted = df.sort_values(by='timestamp')

# Инициализация списков для данных игроков
players = {str(int(i)): [] for i in range(1, 11)}  # Приведение id к int и затем к str

# Разбиение данных по игрокам
for index, row in df_sorted.iterrows():
    player_id = str(int(row['id']))  # Приведение id к int и затем к str
    players[player_id].append(row[['timestamp', 'id', 'x', 'y']])

# Отрисовка графиков траекторий для каждого игрока
for player_id, player_data in players.items():
    if not player_data:
        continue
    
    player_df = pd.concat(player_data, axis=1).T  # Преобразование списка DataFrame
    player_df['x'] = player_df['x'].astype(float)
    player_df['y'] = player_df['y'].astype(float)

    plt.figure(figsize=(10, 6))
    plt.plot(player_df['x'], player_df['y'], label=f'Player {player_id}')
    
    plt.title(f'Trajectory for Player {player_id}')
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.legend()
    plt.grid(True)
    plt.show()
