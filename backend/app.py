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
    content = request.json.get('content')
    completed = request.json.get('completed')
    query = "UPDATE todos SET "
    params = []
    if content is not None:
        query += "content = %s, "
        params.append(content)
    if completed is not None:
        query += "completed = %s, "
        params.append(completed)
    query = query.rstrip(", ")  # Remove trailing comma
    query += " WHERE id = %s RETURNING id, content, completed;"
    params.append(id)
    try:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            updated_todo = cur.fetchone()
            print("Updated todo:", updated_todo)  # Log du todo mis à jour
            conn.commit()
        return jsonify({'id': updated_todo[0], 'content': updated_todo[1], 'completed': updated_todo[2]})
    except psycopg2.Error as e:
        print(f"Error updating todo: {e}")
        conn.rollback()
        return jsonify({'error': 'Error updating todo'}), 500

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM todos WHERE id = %s RETURNING id;", (id,))
            deleted_id = cur.fetchone()
            conn.commit()
        return jsonify({'id': deleted_id[0]})
    except psycopg2.Error as e:
        print(f"Error deleting todo: {e}")
        conn.rollback()
        return jsonify({'error': 'Error deleting todo'}), 500

@app.route('/todos/completed', methods=['DELETE'])
def delete_completed_todos():
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM todos WHERE completed = TRUE RETURNING id;")
            deleted_ids = cur.fetchall()
            conn.commit()
        return jsonify([row[0] for row in deleted_ids])
    except psycopg2.Error as e:
        print(f"Error deleting completed todos: {e}")
        conn.rollback()
        return jsonify({'error': 'Error deleting completed todos'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
