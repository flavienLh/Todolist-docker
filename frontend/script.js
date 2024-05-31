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
                    updateTodo(todo.id, { completed: checkbox.checked });
                });

                li.prepend(checkbox);

                if (!todo.completed) {
                    const editButton = document.createElement("button");
                    editButton.textContent = "Edit";
                    editButton.addEventListener("click", () => {
                        const newContent = prompt("Enter new content", todo.content);
                        if (newContent) {
                            updateTodo(todo.id, { content: newContent });
                        }
                    });

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.addEventListener("click", () => {
                        deleteTodo(todo.id);
                    });

                    li.appendChild(editButton);
                    li.appendChild(deleteButton);

                    todoList.appendChild(li);
                } else {
                    li.classList.add("completed");
                    completedTodoList.appendChild(li);
                    setTimeout(() => deleteCompletedTodos(), 15000); // 15000ms = 15 seconds for testing
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
            updateTodo(todo.id, { completed: checkbox.checked });
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            const newContent = prompt("Enter new content", todo.content);
            if (newContent) {
                updateTodo(todo.id, { content: newContent });
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteTodo(todo.id);
        });

        li.prepend(checkbox);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        todoList.appendChild(li);
        input.value = "";
    })
    .catch(error => console.error('Error adding todo:', error));
}

function updateTodo(id, updates) {
    fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    })
    .then(response => response.json())
    .then(todo => {
        const li = document.querySelector(`li[data-id='${id}']`);
        if (li) {
            li.textContent = todo.content;
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = todo.completed;
            checkbox.addEventListener("change", () => {
                updateTodo(todo.id, { completed: checkbox.checked });
            });

            li.prepend(checkbox);

            if (!todo.completed) {
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => {
                    const newContent = prompt("Enter new content", todo.content);
                    if (newContent) {
                        updateTodo(todo.id, { content: newContent });
                    }
                });

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => {
                    deleteTodo(todo.id);
                });

                li.appendChild(editButton);
                li.appendChild(deleteButton);

                li.classList.remove("completed");
                document.getElementById("todo-list").appendChild(li);
            } else {
                li.classList.add("completed");
                document.getElementById("completed-todo-list").appendChild(li);
            }
        }
    })
    .catch(error => console.error('Error updating todo:', error));
}

function deleteTodo(id) {
    fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(deleted => {
        const li = document.querySelector(`li[data-id='${id}']`);
        if (li) {
            li.remove();
        }
    })
    .catch(error => console.error('Error deleting todo:', error));
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
