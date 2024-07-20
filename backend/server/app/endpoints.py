from flask import jsonify, request
from app import app, db
from app.models import Player, TrajectoryPoint
import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
import random
import time
import copy
import base64
import redis
import json
from sqlalchemy import func, case, desc


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
redis_client = redis.Redis(host='77.221.156.184', port=6379)

# Define the Redis key format for player data
PLAYER_DATA_KEY_FORMAT = "player_data:{}"

global_traj = {}

def update_square_counts(player):
    square_x = int(player.x // square_width)
    square_y = int((field_height - player.y) // square_height)

    checker = True

    for slov in square_counts[square_y][square_x]:
        # print(slov)
        if slov['name'] == f"{player.name} {player.surname}":
            slov['count'] += 1
            checker = False
            break


    if checker:
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
            for player in players_data:
                global_traj[player.id] = []
            keys = redis_client.keys("*")
            current_timestamp = time.time()
            print(keys)
            player_id = None

            for key in keys:
                key_type = redis_client.type(key)
                if key_type == b'hash':
                    raw_hash = redis_client.hgetall(key)

                    data = {}
                    for k, v in raw_hash.items():
                        data[k.decode('utf-8')] = v.decode('utf-8')
                    player_id = int(data['id'])

                    print(data)
                elif key_type == b'string':
                    data = json.loads(redis_client.get(key))
                    print(data)
                    player_id = int(data['id'])

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

                        distance = ((abs((player.x / 1280) - (player.lastX / 1280)) * 60) ** 2 + (abs((player.y / 720) - (player.lastY / 720)) * 30) ** 2) ** 0.5
                        print(f"Оценка дистанции: {distance}")
                        if distance > 18:
                            player.x = player.lastX
                            player.y = player.lastY
    

                        if len(global_traj[player.id]) < 6:
                            print('Траектория добавлена в сток')
                            global_traj[player.id].append({'x': player.x, 'y': player.y, 'order': len(global_traj[player.id])})
                        else:
                            print('Предел траекторий достигнут')
                        print(global_traj[player.id])
                        player.dist += int(distance)

                        elapsed_time = current_timestamp  - match_start_time
                        player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                        player.time = int(elapsed_time)

                        try:
                            update_square_counts(player)
                        except BaseException:
                            print("sorry")
                    
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


@app.route('/api/match_time', methods=['GET'])
def get_match_time():
    if match_running:
        elapsed_time = time.time() - match_start_time
        return jsonify({"match_time": elapsed_time})
    else:
        return jsonify({"match_time": 0})
    
@app.route('/api/match_start_time', methods=['GET'])
def get_match_start_time():
    global match_start_time
    return jsonify({"match_start_time": match_start_time})

@app.route("/api/clear_trajectory_points", methods=["POST"])
def clear_trajectory_points():
    try:
        with app.app_context():
            db.session.query(TrajectoryPoint).delete()
            db.session.commit()

            return jsonify({"message": "Trajectory points cleared"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



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
            'position': player.position,
            'grip': player.grip,
            'visibility': player.visibility,
            'image': base64.b64encode(player.avatar).decode('utf-8') if player.avatar else "NO IMAGE",
            'traj': global_traj[player.id],
        })
        # global_traj[player.id] = []

    # print(players_data)
    return jsonify(players_data)

from sqlalchemy import func

@app.route('/api/square_counts', methods=['GET'])
def get_square_counts():
    square_counts = [[{"name": "", "count": 0, "top_players": []}] * num_squares_x for _ in range(num_squares_y)]
    
    with app.app_context():
        # Query to get the counts and top players for each square
        query = db.session.query(
            func.floor(TrajectoryPoint.x / square_width).label('col'),
            func.floor(TrajectoryPoint.y / square_width).label('row'),
            func.count().label('count'),
            func.group_concat(Player.num).label('top_players')
        ).join(Player, TrajectoryPoint.player_id == Player.id).\
        group_by('col', 'row').subquery()

        # Get the results and update square_counts
        results = db.session.query(query).all()
        for result in results:
            row_index = int(result.row)
            col_index = int(result.col)

            if 0 <= row_index < num_squares_y and 0 <= col_index < num_squares_x:
                square_counts[row_index][col_index] = {
                    "name": "",
                    "count": result.count,
                    "top_players": result.top_players.split(',') if result.top_players else []
                }
            else:
                print(f"Ignoring result with out-of-range indices: row={result.row}, col={result.col}")

    print(square_counts)

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

            # Читаем CSV файл
            # csv_data = read_csv_data('fake.csv')  # Укажите путь к вашему CSV файлу
            # unique_timestamps = csv_data['timestamp'].unique()


            # timestamp_iterator = iter(unique_timestamps)

            # Обновляем данные из CSV файла
            # process_csv_data(csv_data, timestamp_iterator)

            # Перезапускаем job process_csv_data с новым вызовом
            scheduler.add_job(process_redis_data, 'interval', seconds=2 )

            return jsonify({"message": "Match started"})
        else:
            return jsonify({"message": "Match already running"})
        
# Замените на ваш метод получения статистики матча
@app.route('/api/match_analytics/', methods=['GET'])
def get_match_analytics():
    with app.app_context():
        players = Player.query.all()
        total_distance_online = sum(player.dist for player in players)


    analytics_data = {
        'matchId': 1,
        'duration': time.time() - match_start_time,
        'totalDistanceOnline': f'{total_distance_online:.2f} km',
        # Добавьте другие поля статистики матча
    }

    return jsonify(analytics_data)

@app.route('/api/end_match', methods=['POST'])
def end_match():
    global match_running, match_start_time
    if match_running:
        match_running = False
        match_start_time = 0
    
        # Remove jobs from the scheduler
        scheduler.remove_all_jobs()
    
        # Clear existing player data in Redis
        for player in players_data:
            redis_key = PLAYER_DATA_KEY_FORMAT.format(player.id)
            redis_client.delete(redis_key)
    
        match_running = False
        match_start_time = 0
    
        return jsonify({"message": "Match ended"})
    else:
        return jsonify({"message": "Match not running"})

@app.route('/api/player/<int:player_id>', methods=['GET'])
def get_player_by_id(player_id):
    with app.app_context():
        movements = db.session.query(
        db.func.avg(TrajectoryPoint.x / 1280 * 60).label('avg_x'),
        db.func.avg(TrajectoryPoint.y / 720 * 30).label('avg_y'),   
        db.func.floor(TrajectoryPoint.time).label('minute')
        ).filter_by(player_id=player_id).group_by('minute').all()

    # Assuming you want to calculate speed as the Euclidean distance between consecutive positions
        speeds = []
        accelerations = 0
        decelerations = 0

        for i in range(1, len(movements)):
            prev_movement = movements[i - 1]
            current_movement = movements[i]

            distance = ((current_movement.avg_x - prev_movement.avg_x)**2 + (current_movement.avg_y - prev_movement.avg_y)**2)**0.5

            speed = distance / (current_movement.minute - prev_movement.minute) * 60



            speeds.append({'minute': current_movement.minute, 'average_speed': speed})


        print(speeds)

        filtered_speed_data = [entry for entry in speeds if entry['average_speed'] <= 25]

        for i in range(len(filtered_speed_data)):
            if filtered_speed_data[i]['average_speed'] - filtered_speed_data[i - 1]['average_speed'] > 5:
                accelerations += 1
            elif filtered_speed_data[i]['average_speed'] - filtered_speed_data[i - 1]['average_speed'] > -5:
                decelerations += 1

        max_speed = max([speed['average_speed'] for speed in filtered_speed_data], default=0)
        min_speed = min([speed['average_speed'] for speed in filtered_speed_data], default=0)
        avg_speed = sum([speed['average_speed'] for speed in filtered_speed_data]) / len(speeds) if speeds else 0



        player = Player.query.get(player_id)
        if player:
            player_data = {
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
                'speeds': filtered_speed_data,
                'accelerations': accelerations,
                'decelerations': decelerations,
                'position': player.position,
                'grip': player.grip,
                'visibility': player.visibility,
                'max_speed': int(max_speed),
                'avg_speed': int(avg_speed),
                'min_speed': int(min_speed) ,
                'height': player.height ,
                'weight': player.weight ,
                'age': player.age ,
                'birth_date': player.birth_date ,


            }
            return jsonify(player_data)
        else:
            return jsonify({"message": "NOOOOOO"})

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
