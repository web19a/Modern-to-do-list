const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');
const dueDate = document.getElementById('dueDate');
const progress = document.querySelector('.progress');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let draggedItem = null;

// Initialize
renderTasks();
updateProgress();

// Set default priority to "Low" and due date to today
prioritySelect.value = 'low';
dueDate.value = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

// Event Listeners
addButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
todoList.addEventListener('click', handleListClick);
todoList.addEventListener('dragstart', handleDragStart);
todoList.addEventListener('dragover', handleDragOver);
todoList.addEventListener('dragend', handleDragEnd);

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const task = {
        text: taskText,
        completed: false,
        priority: prioritySelect.value || 'low', // Default to "Low" if not set
        dueDate: dueDate.value || new Date().toISOString().split('T')[0], // Default to today
        id: Date.now()
    };

    tasks.push(task);
    saveAndRender();
    taskInput.value = '';
    dueDate.value = new Date().toISOString().split('T')[0]; // Reset to today after adding
    taskInput.focus();
}

function handleListClick(e) {
    const target = e.target;
    
    if (target.classList.contains('delete-btn')) {
        showDeleteConfirmation(target.closest('li').dataset.id);
    } else if (target.type === 'checkbox') {
        toggleComplete(target.closest('li').dataset.id);
    }
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id == id);
    task.completed = !task.completed;
    saveAndRender();
}

function handleDragStart(e) {
    if (e.target.classList.contains('todo-item')) {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    const currentPos = tasks.findIndex(t => t.id == draggedItem.dataset.id);
    
    if (afterElement) {
        const afterPos = tasks.findIndex(t => t.id == afterElement.dataset.id);
        if (currentPos > afterPos) {
            todoList.insertBefore(draggedItem, afterElement);
            tasks.splice(afterPos, 0, tasks.splice(currentPos, 1)[0]);
        }
    } else {
        todoList.appendChild(draggedItem);
        tasks.push(tasks.splice(currentPos, 1)[0]);
    }
}

function getDragAfterElement(y) {
    return [...todoList.querySelectorAll('.todo-item:not(.dragging)')]
        .reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return offset < 0 && offset > closest.offset ? 
                { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDragEnd() {
    draggedItem.classList.remove('dragging');
    saveToLocalStorage();
}

function showDeleteConfirmation(id) {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'flex';

    document.getElementById('confirmDelete').onclick = () => {
        tasks = tasks.filter(t => t.id != id);
        saveAndRender();
        modal.style.display = 'none';
    };

    document.getElementById('cancelDelete').onclick = () => {
        modal.style.display = 'none';
    };
}

function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const progressWidth = (completed / tasks.length) * 100 || 0;
    progress.style.width = `${progressWidth}%`;
}

function renderTasks() {
    todoList.innerHTML = tasks.map(task => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" 
            data-id="${task.id}" draggable="true">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.text}</span>
            <div class="priority-indicator priority-${task.priority}"></div>
            ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
            <button class="delete-btn">Delete</button>
        </li>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

function saveAndRender() {
    saveToLocalStorage();
    renderTasks();
    updateProgress();
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}