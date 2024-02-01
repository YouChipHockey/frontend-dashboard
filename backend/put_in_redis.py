import redis
import pandas as pd
import json
import time
import random

# Подключение к Redis
redis_host = '91.108.241.205'
redis_port = 6379
redis_db = 0
redis_password = None  # Укажите пароль, если он у вас есть

r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_password)

while True:
    my_dict = {'id': random.randint(1,10), 'x': random.randint(5, 30), 'y':random.randint(5, 60), 'timestamp': time.time()}
    r.set(str(len(r.keys()) + 1), json.dumps(my_dict))
    print(my_dict)
    time.sleep(random.randint(1,3))

print(r.keys())