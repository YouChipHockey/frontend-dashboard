from flask import jsonify, request
from app import app, db
from app.models import Player, TrajectoryPoint

from apscheduler.schedulers.background import BackgroundScheduler
import random
import time
import copy
import base64
import redis  # Import the Redis library

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

def generate_new_data_redis():
    global match_start_time, players_data
    with app.app_context():
        players_data = Player.query.all()  

    current_time = int(time.time())  # Current time in seconds
    print(current_time - match_start_time)
    print(players_data)

    with app.app_context():
        for player in players_data:
            if match_running:
                player.lastX = player.x
                player.lastY = player.y

                player.x += random.uniform(-50, 50)
                player.y += random.uniform(-50, 50)

                player.x = max(0, min(player.x, field_width))
                player.y = max(0, min(player.y, field_height))

                distance = ((player.x - player.lastX) ** 2 + (player.y - player.lastY) ** 2) ** 0.5
                player.dist += int(distance)

                elapsed_time = current_time - match_start_time
                player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                player.time = int(elapsed_time)

                update_square_counts(player)

                # Prepare player data for Redis
                redis_key = str(current_time)
                player_data_redis = {
                    "id": player.id,
                    "x": player.x,
                    "y": player.y,
                    "timestamp": current_time
                }

                # Store player data in Redis
                redis_client.hmset(redis_key, player_data_redis)

def process_redis_data():
    global match_start_time, players_data

    with app.app_context():
        # Get all keys in Redis matching the pattern '*'
        redis_keys = redis_client.zrevrange(PLAYER_DATA_KEY_FORMAT.format('*'), 0, -1)

        for redis_key in redis_keys:
            player_data_redis = redis_client.hgetall(redis_key)

            # Check if player data exists in Redis
            if player_data_redis:
                timestamp = int(redis_key)

                # Only update if the timestamp is after the match start time
                if timestamp > match_start_time:
                    player_id = int(player_data_redis.get("id", 0))
                    player = next((p for p in players_data if p.id == player_id), None)

                    if player:
                        player.x = float(player_data_redis.get("x", 0))
                        player.y = float(player_data_redis.get("y", 0))

                        distance = ((player.x - player.lastX) ** 2 + (player.y - player.lastY) ** 2) ** 0.5
                        player.dist += int(distance)

                        elapsed_time = timestamp - match_start_time
                        player.speed = int(distance / elapsed_time) if elapsed_time > 0 else 0

                        player.time = int(elapsed_time)

                        update_square_counts(player)

                        trajectory_point = TrajectoryPoint(
                            time=player.time,
                            x=player.x,
                            y=player.y,
                            player_id=player.id
                        )
                        db.session.add(trajectory_point)

                        # Delete the processed data from Redis
                        redis_client.zrem(PLAYER_DATA_KEY_FORMAT.format('*'), redis_key)

        try:
            db.session.commit()
        except:
            print(f"Error:. Retrying...")
            db.session.rollback()
            process_redis_data()



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
    players_data = [
    {
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
            'image': base64.b64encode(player.avatar).decode('utf-8') if player.avatar else "NO IMAGE"
    }
    for player in players
    ]
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
    global match_running, match_start_time, square_counts
    for player in players_data:
        player.x = 600
        player.y = 300
    square_counts = [[[{"name": f"", "count": 0}]] * num_squares_x for _ in range(num_squares_y)]
    
    if not match_running:
        match_running = True
        match_start_time = time.time()
        
        # Clear existing player data in Redis
        for player in players_data:
            redis_key = PLAYER_DATA_KEY_FORMAT.format(player.id)
            redis_client.delete(redis_key)
        
        scheduler.add_job(generate_new_data_redis, 'interval', seconds=1)
        scheduler.add_job(process_redis_data, 'interval', seconds=1)
        
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

    try:
        app.run(host=HOST, port=PORT, debug=DEBUG)
    finally:
        scheduler.shutdown()

if __name__ == '__main__':
    main()
