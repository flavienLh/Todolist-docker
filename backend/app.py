from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Attendre que la base de données soit prête avant de se connecter
while True:
    try:
        conn = psycopg2.connect(
            dbname="todolist",
            user="postgres",
            password="postgres",
            host="db"
        )
        break
    except psycopg2.OperationalError:
        print("Database not ready, waiting...")
        time.sleep(5)

@app.route('/todos', methods=['GET'])
def get_todos():
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM todos;")
        todos = cur.fetchall()
    return jsonify([{'id': row[0], 'content': row[1]} for row in todos])

@app.route('/todos', methods=['POST'])
def add_todo():
    content = request.json['content']
    print('Received content:', content)  # Log le contenu reçu
    with conn.cursor() as cur:
        cur.execute("INSERT INTO todos (content) VALUES (%s) RETURNING id, content;", (content,))
        new_todo = cur.fetchone()
        conn.commit()
    return jsonify({'id': new_todo[0], 'content': new_todo[1]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
