class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.sortDateBtn = document.getElementById('sortDate');

        this.initializeEventListeners();
        this.renderTasks();
    }

    initializeEventListeners() {
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.categoryFilter.addEventListener('change', () => this.renderTasks());
        this.sortDateBtn.addEventListener('click', () => this.sortTasksByDate());

        // Drag and drop
        this.taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            }
        });

        this.taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
            }
        });

        this.taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const afterElement = this.getDragAfterElement(this.taskList, e.clientY);
                if (afterElement) {
                    this.taskList.insertBefore(draggable, afterElement);
                } else {
                    this.taskList.appendChild(draggable);
                }
            }
        });
    }

    handleAddTask(e) {
        e.preventDefault();
        const taskInput = document.getElementById('taskInput');
        const taskCategory = document.getElementById('taskCategory');
        const dueDate = document.getElementById('dueDate');

        const newTask = {
            id: Date.now().toString(),
            text: taskInput.value,
            category: taskCategory.value,
            dueDate: dueDate.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.taskForm.reset();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null) {
                task.text = newText;
                this.saveTasks();
                this.renderTasks();
            }
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const selectedCategory = this.categoryFilter.value;
        let filteredTasks = this.tasks;

        if (selectedCategory !== 'all') {
            filteredTasks = this.tasks.filter(task => task.category === selectedCategory);
        }

        this.taskList.innerHTML = '';

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.draggable = true;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-content">
                    <span>${task.text}</span>
                    <span class="task-category category-${task.category}">${task.category}</span>
                    <span>${new Date(task.dueDate).toLocaleString()}</span>
                </div>
                <div class="task-actions">
                    <button onclick="taskManager.toggleTaskComplete('${task.id}')">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="edit-btn" onclick="taskManager.editTask('${task.id}')">
                        Edit
                    </button>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        Delete
                    </button>
                </div>
            `;

            this.taskList.appendChild(li);
        });
    }

    sortTasksByDate() {
        this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        this.renderTasks();
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// Initialize the task manager
const taskManager = new TaskManager();