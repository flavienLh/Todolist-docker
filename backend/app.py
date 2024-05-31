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
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM todos;")
            todos = cur.fetchall()
            print("Fetched todos:", todos)  # Log des données récupérées
        return jsonify([{'id': row[0], 'content': row[1], 'completed': row[2]} for row in todos])
    except psycopg2.Error as e:
        print(f"Error fetching todos: {e}")
        conn.rollback()
        return jsonify({'error': 'Error fetching todos'}), 500

@app.route('/todos', methods=['POST'])
def add_todo():
    content = request.json['content']
    print('Received content:', content)  # Log du contenu reçu
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO todos (content) VALUES (%s) RETURNING id, content, completed;", (content,))
            new_todo = cur.fetchone()
            print("Inserted todo:", new_todo)  # Log du nouveau todo inséré
            conn.commit()
        return jsonify({'id': new_todo[0], 'content': new_todo[1], 'completed': new_todo[2]})
    except psycopg2.Error as e:
        print(f"Error adding todo: {e}")
        conn.rollback()
        return jsonify({'error': 'Error adding todo'}), 500

@app.route('/todos/<int:id>', methods=['PATCH'])
def update_todo(id):
    completed = request.json['completed']
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE todos SET completed = %s WHERE id = %s RETURNING id, content, completed;", (completed, id))
            updated_todo = cur.fetchone()
            print("Updated todo:", updated_todo)  # Log du todo mis à jour
            conn.commit()
        return jsonify({'id': updated_todo[0], 'content': updated_todo[1], 'completed': updated_todo[2]})
    except psycopg2.Error as e:
        print(f"Error updating todo: {e}")
        conn.rollback()
        return jsonify({'error': 'Error updating todo'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
