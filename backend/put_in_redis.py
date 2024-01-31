import redis
import pandas as pd
import json
import time

# Подключение к Redis
redis_host = '91.108.241.205'
redis_port = 6379
redis_db = 0
redis_password = None  # Укажите пароль, если он у вас есть

r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_password)

my_dict = {'id': 6, 'x': 15, 'y':18, 'timestamp': time.time()}
r.set(str(len(r.keys()) + 1), json.dumps(my_dict))