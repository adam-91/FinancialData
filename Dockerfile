FROM python:3.14-slim

WORKDIR /app

COPY ./app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app .

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["python", "main.py"]