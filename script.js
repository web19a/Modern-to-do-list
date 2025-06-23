const form = document.getElementById("todo-form");
    const taskInput = document.getElementById("task");
    const dueDateInput = document.getElementById("due-date");
    const priorityInput = document.getElementById("priority");
    const list = document.getElementById("todo-list");
    const darkToggle = document.querySelector(".dark-toggle");

    // Load saved tasks
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {
      list.innerHTML = "";
      tasks.forEach((t, i) => {
        const taskEl = document.createElement("div");
        taskEl.className = `task ${t.priority}`;
        taskEl.innerHTML = `
          <div>
            <span><strong>${t.text}</strong></span>
            <span>Due: ${t.dueDate || "—"}</span>
          </div>
          <button class="remove" onclick="removeTask(${i})">✕</button>
        `;
        list.appendChild(taskEl);
      });
    }

    function removeTask(index) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newTask = {
        text: taskInput.value.trim(),
        dueDate: dueDateInput.value,
        priority: priorityInput.value,
      };
      if (newTask.text) {
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        form.reset();
      }
    });

    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });

    // Initial render
    renderTasks();
