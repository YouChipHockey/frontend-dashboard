import redis
import time

r = redis.Redis(
    host='91.108.240.55',
    port=6379,
)

keys = r.keys('*')

for key in keys:
    # Определение типа данных
    key_type = r.type(key)
    
    print(key_type)
    if key_type == b'string':
        print(f'Key: {key}, Value: {r.get(key)}')
    elif key_type == b'list':
        print(f'Key: {key}, Values: {r.lrange(key, 0, -1)}')
    elif key_type == b'set':
        print(f'Key: {key}, Values: {r.smembers(key)}')
    elif key_type == b'zset':
        print(f'Key: {key}, Values: {r.zrange(key, 0, -1)}')
    elif key_type == b'hash':
        print(f'Key: {key}, Values: {r.hgetall(key)}')
    
