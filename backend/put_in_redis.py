import redis
import pandas as pd
import json
import time
import random

# Подключение к Redis
redis_host = '77.221.156.184'
redis_port = 6379
redis_db = 0
redis_password = None  # Укажите пароль, если он у вас есть

r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_password)

while True:
    my_dict = {'id': 10, 'x': random.randint(27, 30), 'y': 30, 'timestamp': time.time()}
    r.set(str(len(r.keys()) + 1), json.dumps(my_dict))
    print(my_dict)
    time.sleep(random.randint(1,3))

# # while True:
# my_dict = {'id': 10, 'x': random.randint(27, 30), 'y': 30, 'timestamp': time.time()}
# r.set(str(len(r.keys()) + 1), json.dumps(my_dict))

# # my_dict = {'id': 10, 'x': 15, 'y': 30, 'timestamp': time.time()}
# # r.set(str(len(r.keys()) + 1), json.dumps(my_dict))


# my_dict = {'id': 10, 'x': random.randint(0, 3), 'y': 28, 'timestamp': time.time()}
# r.set(str(len(r.keys()) + 1), json.dumps(my_dict))
# time.sleep(3)
# print(my_dict)

# # my_dict = {'id': 10, 'x': 15, 'y': 30, 'timestamp': time.time()}
# # r.set(str(len(r.keys()) + 1), json.dumps(my_dict))

# my_dict = {'id': 10, 'x': random.randint(27, 30), 'y': 30, 'timestamp': time.time()}
# r.set(str(len(r.keys()) + 1), json.dumps(my_dict))
# print(my_dict)

# time.sleep(3)
# print(r.keys())