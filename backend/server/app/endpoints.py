from flask import jsonify, request
from app import app, db
from app.models import Player, TrajectoryPoint
import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
import random
import time
import copy
import base64
import redis  # Import the Redis library
import json

from common.pereferences import DEBUG, PORT, HOST

field_width = 1280
field_height = 768
num_squares_x = 20
num_squares_y = 9

square_width = field_width // num_squares_x
square_height = field_height // num_squares_y

square_counts = [[[{"name": f"", "count": 0}]] * num_squares_x for _ in range(num_squares_y)]

scheduler = BackgroundScheduler()  
scheduler.start()

match_running = False
match_start_time = 0

# Connect to Redis
redis_client = redis.Redis(host='91.108.241.205', port=6379)

# Define the Redis key format for player data
PLAYER_DATA_KEY_FORMAT = "player_data:{}"

global_traj = {}

def update_square_counts(player):
    square_x = int(player.x // square_width)
    square_y = int((field_height - player.y) // square_height)

    # print(player)
    # print(square_x, square_y)

    # print([[sum(dictionary['count'] for dictionary in arr_dict) for arr_dict in row] for row in square_counts])

    checker = True

    for slov in square_counts[square_y][square_x]:
        # print(slov)
        if slov['name'] == f"{player.name} {player.surname}":
            slov['count'] += 1
            checker = False
            break

    # print([[sum(dictionary['count'] for dictionary in arr_dict) for arr_dict in row] for row in square_counts])

    if checker:
        # print('CHEEEEk')
        square_counts[square_y][square_x] = [copy.deepcopy({"name": f"{player.name} {player.surname}", "count": 1, "team": player.team})]

def read_csv_data(file_path):
    df = pd.read_csv(file_path)
    return df

def process_csv_data(csv_data, timestamp_iterator):
    global match_start_time, players_data
    with app.app_context():
            current_timestamp = next(timestamp_iterator)
            timestamp_rows = csv_data[csv_data['timestamp'] == current_timestamp]

            for _, row in timestamp_rows.iterrows():
                player_id = row['id']
                if not global_traj[player.id]:
                    global_traj[player.id] = []

                player = next((p for p in players_data if p.id == player_id), None)

                if player:
                    x_60x30 = float(row['x']) if not pd.isna(row['x']) else 0
                    y_60x30 = float(row['y']) if not pd.isna(row['y']) else 0

                    print(x_60x30, y_60x30)

                    # Конвертация координат в формат 1280x720
                    x_1280x720 = (y_60x30 / 60) * 1280
                    y_1280x720 = (x_60x30 / 30) * 720
                    
                    player.x = 1280 - x_1280x720
                    player.y = 720 - y_1280x720

                    player.lastX = player.x
                    player.lastY = player.y

                    distance = ((player.x - player.lastX) ** 2 + (player.y - player.lastY) ** 2) ** 0.5
                    player.dist += int(distance)

                    elapsed_time = current_timestamp  - match_start_time
                    player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                    player.time = int(elapsed_time)

                    trajectory_point = TrajectoryPoint(
                    time=player.time,
                    x=player.x,
                    y=player.y,
                    player_id=player.id
                    )
                    db.session.add(trajectory_point)

                existing_player = Player.query.get(player.id)
                if existing_player:
                    # Применяем изменения
                    existing_player.lastX = player.lastX
                    existing_player.lastY = player.lastY
                    existing_player.x = player.x
                    existing_player.y = player.y
                    existing_player.dist = player.dist
                    existing_player.speed = player.speed
                    existing_player.time = player.time

            try:
                db.session.commit()
            except:
                print(f"Error: Retrying...")
                db.session.rollback()

def process_redis_data():
    global match_start_time, players_data, global_traj
    with app.app_context():
            keys = redis_client.keys("*")
            current_timestamp = time.time()
            print(keys)
            player_id = None

            for key in keys:
                key_type = redis_client.type(key)
                if key_type == b'hash':
                    raw_hash = redis_client.hgetall(key)

                    # Преобразуйте хеш в словарь Python
                    data = {}
                    for k, v in raw_hash.items():
                        data[k.decode('utf-8')] = v.decode('utf-8')
                    player_id = int(data['id'])

                    print(data)
                elif key_type == b'string':
                    data = json.loads(redis_client.get(key))
                    print(data)
                    player_id = int(data['id'])

                # player_id = int(data['id'])
                player = next((p for p in players_data if p.id == player_id), None)


                if player:
                    if not global_traj[player.id]:
                        global_traj[player.id] = []
                    try:
                        x_60x30 = float(data['x']) if data['x'] != 'NaN' and data['x'] != '-Inf' and data['x'] != '+Inf' else (player.x / 1280) * 60
                        y_60x30 = float(data['y']) if data['y'] != 'NaN' and data['y'] != '-Inf' and data['y'] != '+Inf' else (player.y / 720) * 30

                        print(x_60x30, y_60x30)

                    # Конвертация координат в формат 1280x720
                        x_1280x720 = (y_60x30 / 60) * 1280
                        y_1280x720 = (x_60x30 / 30) * 720

                        player.lastX = player.x
                        player.lastY = player.y

                        # player.x = max(x_1280x720, 0)
                        # player.y = min(y_1280x720, 0)
                    
                        player.x = 1280 - x_1280x720
                        player.y = 720 - y_1280x720

                        if len(global_traj[player.id]) < 5:
                            print('Траектория добавлена в сток')
                            global_traj[player.id].append({'x': player.x, 'y': player.y, 'order': len(global_traj[player.id])})
                        else:
                            print('Предел траекторий достигнут')
                        print(global_traj[player.id])
                        distance = ((player.x - player.lastX) ** 2 + (player.y - player.lastY) ** 2) ** 0.5
                        player.dist += int(distance)

                        elapsed_time = current_timestamp  - match_start_time
                        player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                        player.time = int(elapsed_time)
                    
                    except:
                        print('Кринж в координатах')

                    trajectory_point = TrajectoryPoint(
                    time=player.time,
                    x=player.x,
                    y=player.y,
                    player_id=player.id
                    )
                    db.session.add(trajectory_point)


                redis_client.delete(key)

                existing_player = Player.query.get(player.id)
                if existing_player:
                    # Применяем изменения
                    existing_player.lastX = player.lastX
                    existing_player.lastY = player.lastY
                    existing_player.x = player.x
                    existing_player.y = player.y
                    existing_player.dist = player.dist
                    existing_player.speed = player.speed
                    existing_player.time = player.time

            try:
                db.session.commit()
            except:
                print(f"Error: Retrying...")
                db.session.rollback()

def generate_new_coordinates(current_x, current_y):
    points_count = random.randint(1, 5)

    traj_points = []

    traj_points.append({'x':current_x ,'y': current_y,'order': 0})

    for point in range(1, points_count + 1):
        delta_x = random.uniform(-16.8, 16.8)
        delta_y = random.uniform(-16.8, 16.8)

        x_1280x720 = (delta_x / 60) * 1280
        y_1280x720 = (delta_y / 30) * 720

        new_x = max(current_x + x_1280x720, 0)
        new_y = max(current_y + y_1280x720, 0)

        new_x = min(new_x, 1280)
        new_y = min(new_y, 720)

        traj_points.append({'x':new_x ,'y': new_y,'order': point})


    return traj_points

def generate_points_for_frontend():
    global match_start_time, players_data, global_traj
    with app.app_context():
        players_data = Player.query.all()
        for player in players_data:
                        traj_points = generate_new_coordinates(player.x, player.y)

                        global_traj[player.id] = traj_points

                        player.lastX = player.x
                        player.lastY = player.y
                    
                        player.x = traj_points[-1]['x']
                        player.y = traj_points[-1]['y']

                        distance = ((player.x - player.lastX) ** 2 + (player.y - player.lastY) ** 2) ** 0.5
                        player.dist += int(distance)

                        elapsed_time = int(time.time()) - match_start_time
                        player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                        player.time = int(elapsed_time)

                        existing_player = Player.query.get(player.id)
                        if existing_player:
                    # Применяем изменения
                            existing_player.lastX = player.lastX
                            existing_player.lastY = player.lastY
                            existing_player.x = player.x
                            existing_player.y = player.y
                            existing_player.dist = player.dist
                            existing_player.speed = player.speed
                            existing_player.time = player.time
                        
                        try:
                            db.session.commit()
                        except:
                            print(f"Error: Retrying...")
                            db.session.rollback()




@app.route('/api/filtered_trajectories', methods=['POST'])
def get_filtered_trajectories():
    try:
        data = request.get_json()
        start_time = data.get('start_time', 0)
        end_time = data.get('end_time', float('inf'))

        filtered_trajectories = filter_trajectories_by_time(start_time, end_time)
        # print(filtered_trajectories)

        return jsonify(filtered_trajectories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def filter_trajectories_by_time(start_time, end_time):
    filtered_trajectories = {}
    with app.app_context():
        players_data = Player.query.all()
        for player in players_data:
            # Загрузите траектории внутри контекста приложения
            db.session.refresh(player)  # Обновите состояние объекта Player в текущей сессии
            filtered_trajectory = [
                {'time': point.time, 'x': point.x, 'y': point.y}
                for point in player.trajectory
                if start_time <= point.time <= end_time
            ]
            filtered_trajectories[player.id] = {
                'id': player.id,
                'team': player.team,
                'num': player.num,
                'name': player.name,
                'surname': player.surname,
                'trajectory': filtered_trajectory
            }
    return filtered_trajectories

@app.route('/api/players', methods=['GET', 'OPTIONS'])
def get_players_data():
    players = Player.query.all()
    players_data = []
    for player in players:
        players_data.append({
            'id': player.id,
            'team': player.team,
            'num': player.num,
            'name': player.name,
            'surname': player.surname,
            'x': player.x,
            'y': player.y,
            'speed': player.speed,
            'dist': player.dist,
            'time': player.time,
            'lastX': player.lastX,
            'lastY': player.lastY,
            'image': base64.b64encode(player.avatar).decode('utf-8') if player.avatar else "NO IMAGE",
            'traj': global_traj[player.id],
        })
        # global_traj[player.id] = []

    # print(players_data)
    return jsonify(players_data)

@app.route('/api/square_counts', methods=['GET'])
def get_square_counts():
    return jsonify(square_counts)

@app.route('/api/trajectories', methods=['GET'])
def get_player_trajectories():
    trajectories = {}
    with app.app_context():
        players_data = Player.query.all()
        for player in players_data:
            # Загрузите траектории внутри контекста приложения
            db.session.refresh(player)  # Обновите состояние объекта Player в текущей сессии
            player_data = {
                'id': player.id,
                'team': player.team,
                'num': player.num,
                'name': player.name,
                'surname': player.surname,
                'trajectory': [
                    {'time': point.time, 'x': point.x, 'y': point.y}
                    for point in player.trajectory
                ]
            }
            trajectories[player.id] = player_data
    return jsonify(trajectories)

@app.route('/api/start_match', methods=['POST'])
def start_match():
    global match_running, match_start_time, square_counts, csv_data, current_csv_index
    with app.app_context():
        # Очищаем данные о текущих игроках
        for player in players_data:
            player.x = 600
            player.y = 300
        square_counts = [[[{"name": f"", "count": 0}]] * num_squares_x for _ in range(num_squares_y)]

        if not match_running:
            match_running = True
            match_start_time = time.time()

            # # Читаем CSV файл
            # csv_data = read_csv_data('fake.csv')  # Укажите путь к вашему CSV файлу
            # unique_timestamps = csv_data['timestamp'].unique()


            # timestamp_iterator = iter(unique_timestamps)

            # # Обновляем данные из CSV файла
            # process_csv_data(csv_data, timestamp_iterator)

            

            # Перезапускаем job process_csv_data с новым вызовом
            scheduler.add_job(process_redis_data, 'interval', seconds=5 )

    return jsonify({"message": "Match started"})

@app.route('/api/end_match', methods=['POST'])
def end_match():
    global match_running, match_start_time
    
    # Remove jobs from the scheduler
    scheduler.remove_all_jobs()
    
    # Clear existing player data in Redis
    for player in players_data:
        redis_key = PLAYER_DATA_KEY_FORMAT.format(player.id)
        redis_client.delete(redis_key)
    
    match_running = False
    match_start_time = 0
    
    return jsonify({"message": "Match ended"})

def main():
    global players_data
    with app.app_context():
        db.create_all()
        players_data = Player.query.all()
        for player in players_data:
            global_traj[player.id] = []

    try:
        app.run(host=HOST, port=PORT, debug=DEBUG)
    finally:
        scheduler.shutdown()

if __name__ == '__main__':
    main()
