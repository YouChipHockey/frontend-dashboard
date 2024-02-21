import redis
import pandas as pd

# Подключение к Redis
redis_host = '91.108.240.55'
redis_port = 6379
redis_db = 0
redis_password = None  # Укажите пароль, если он у вас есть

r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_password)

keys = r.keys('*')
data = {}

for key in keys:
    key_str = key.decode('utf-8')
    values_raw = r.hgetall(key)
    values = {k.decode('utf-8'): v.decode('utf-8') for k, v in values_raw.items()}
    data[key_str] = values

# Преобразование данных в список кортежей для сортировки
sorted_data = sorted(data.items(), key=lambda x: int(x[0]))

# Инициализация списка DataFrames для данных игроков
player_dfs = []

# Разбиение данных по игрокам
for key, values in sorted_data:
    player_id = values['id']
    player_df = pd.DataFrame([values], columns=['timestamp', 'id', 'x', 'y'])
    player_dfs.append(player_df)

# Соединение всех DataFrames
df = pd.concat(player_dfs, ignore_index=True)


df.to_csv('log.csv')
# Вывод статистики
print("Статистика игроков:")
print(df)
