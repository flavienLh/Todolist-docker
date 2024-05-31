document.addEventListener("DOMContentLoaded", () => {
    fetchTodos();
});

function fetchTodos() {
    fetch("http://localhost:5000/todos")
        .then(response => response.json())
        .then(data => {
            const todoList = document.getElementById("todo-list");
            todoList.innerHTML = "";
            data.forEach(todo => {
                const li = document.createElement("li");
                li.textContent = todo.content;
                if (todo.completed) {
                    li.classList.add("completed");
                }

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.completed;
                checkbox.addEventListener("change", () => {
                    updateTodo(todo.id, checkbox.checked);
                });

                li.prepend(checkbox);
                todoList.appendChild(li);
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
        const li = document.querySelector(`li[data-id='${todo.id}']`);
        if (todo.completed) {
            li.classList.add("completed");
        } else {
            li.classList.remove("completed");
        }
    })
    .catch(error => console.error('Error updating todo:', error));
}
