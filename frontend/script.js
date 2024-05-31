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
        todoList.appendChild(li);
        input.value = "";
    })
    .catch(error => console.error('Error adding todo:', error));
}
