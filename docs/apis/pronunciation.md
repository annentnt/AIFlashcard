
# API đọc và trích xuất phát âm của 1 từ 

- đường dẫn API
```
http://127.0.0.1:8000/api/pronunciation/word/<str:word>
```

- Gửi Requests
```python
import requests

response = requests.get("http://127.0.0.1:8000/api/pronunciation/word/hello")

print(response.json())
```

- Nhận Response
```json
{
    "partOfSpeech": "interjection",
    "ipa": "/həˈləʊ/",
    "audio_url": "https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3",
    "example": "Hello, everyone."
}
```

- Trường Hợp Lỗi
```json
{
    "error": "Not found"
}
```

# API đọc 1 câu dài (nhiều hơn 1 từ)

- Đường dẫn API
```
http://127.0.0.1:8000/api/pronunciation/sentence/
```

- Gửi request và nhận phản hồi là binary của file.mp3,wav....
```python
import requests

response = requests.post("http://127.0.0.1:8000/api/pronunciation/sentence/", json={'text': 'hello world'})

with open('audio.mp3', 'wb') as f:
    f.write(response.content)
```

- Trường hợp lỗi khi quên gửi text =[]
```json
{
    "error": "Missing 'text'"
}
```

# Đánh giá kết quả phát âm của người đọc 

- Đường dẫn API
```
http://127.0.0.1:8000/api/pronunciation/evaluate/
```

- Gửi phản hồi:
    - `file_autio`: là file chứa phát âm của người đọc.
    - `text`: Nội dung văn bản mà người đọc đang đọc. 

```python
import requests

response = requests.post(
    "http://127.0.0.1:8000/api/pronunciation/evaluate/", 
    files={
        "file_audio": open("audio.mp3", 'rb')
    },
    data={
        "text": "hello everyone"
    }
)

print(response.json())
```

- Nhận Response, điểm được chấm trên thang điểm 9:
    - `content_score`: Mức độ chính xác vệ nội dung (trong khoảng $[0, 9]$)
    - `wer`: Tỉ lệ sai từ (trong khoảng $[0, 1]$)
    - `fluency_score`: Độ trôi chảy dựa vào tốc độ nói (trong khoảng $[0, 9]$)
    - `vocabulary_score`: Độ đa dạng từ vựng (trong khoảng $[0, 9]$)
    - `grammar_score`: điểm ngữ pháp (trong khoảng $[0, 9]$)
    - `transcript`: Chuyển đổi từ âm thanh sang text
```json
{
    "content_score": 5.0,
    "wer": 0.5,
    "fluency_score": 9,
    "vocabulary_score": 9,
    "grammar_score": 9,
    "transcript": "Hello world"
}
```

- Trường hợp lỗi (thiếu file)
```json
{
    "error": "No file uploaded"
}
```
