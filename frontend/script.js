document.addEventListener("DOMContentLoaded", () => {
    fetchTodos();
});

function fetchTodos() {
    fetch("http://localhost:5000/todos")
        .then(response => response.json())
        .then(data => {
            const todoList = document.getElementById("todo-list");
            const completedTodoList = document.getElementById("completed-todo-list");
            todoList.innerHTML = "";
            completedTodoList.innerHTML = "";
            data.forEach(todo => {
                const li = document.createElement("li");
                li.textContent = todo.content;
                li.dataset.id = todo.id;  // Add data-id for reference

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.completed;
                checkbox.addEventListener("change", () => {
                    updateTodo(todo.id, checkbox.checked);
                });

                li.prepend(checkbox);

                if (todo.completed) {
                    li.classList.add("completed");
                    completedTodoList.appendChild(li);
                    setTimeout(() => deleteCompletedTodos(), 300000); // 300000ms = 5 minutes
                } else {
                    todoList.appendChild(li);
                }
            });
        });
}

function addTodo() {
    const input = document.getElementById("todo-input");
    const content = input.value;
    fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(todo => {
        const todoList = document.getElementById("todo-list");
        const li = document.createElement("li");
        li.textContent = todo.content;
        li.dataset.id = todo.id;  // Add data-id for reference

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => {
            updateTodo(todo.id, checkbox.checked);
        });

        li.prepend(checkbox);
        todoList.appendChild(li);
        input.value = "";
    })
    .catch(error => console.error('Error adding todo:', error));
}

function updateTodo(id, completed) {
    fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed })
    })
    .then(response => response.json())
    .then(todo => {
        const li = document.querySelector(`li[data-id='${id}']`);
        if (li) {
            if (completed) {
                li.classList.add("completed");
                document.getElementById("completed-todo-list").appendChild(li);
            } else {
                li.classList.remove("completed");
                document.getElementById("todo-list").appendChild(li);
            }
        }
    })
    .catch(error => console.error('Error updating todo:', error));
}

function deleteCompletedTodos() {
    fetch("http://localhost:5000/todos/completed", {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(deletedIds => {
        console.log('Deleted completed todos:', deletedIds);
        fetchTodos(); // Refresh the list to remove deleted todos
    })
    .catch(error => console.error('Error deleting completed todos:', error));
}
