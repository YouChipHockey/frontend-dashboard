import redis
import time

r = redis.Redis(
    host='91.108.241.205',
    port=6379,
)


print(r.get('foo'))
