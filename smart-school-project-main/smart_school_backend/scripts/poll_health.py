import time
import requests

URL = "http://127.0.0.1:5000/"
for i in range(15):
    try:
        r = requests.get(URL, timeout=2)
        print('status', r.status_code)
        print(r.text)
        break
    except Exception as e:
        print('attempt', i, 'error', e)
        time.sleep(1)
else:
    print('health check failed')
