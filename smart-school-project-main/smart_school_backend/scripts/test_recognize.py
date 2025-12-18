import requests
import json

URL = "http://127.0.0.1:5000/api/face/recognize"
# 1x1 transparent PNG data URL
img_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

resp = requests.post(URL, json={"image_base64": img_data})
print('status', resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print(resp.text)
