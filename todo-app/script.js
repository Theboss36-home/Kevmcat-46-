// Get HTML elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const clearBtn = document.getElementById('clearBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');

// Storage key for local storage
const STORAGE_KEY = 'todoList';

// Load tasks from local storage when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    updateStats();
});

// Add task when button is clicked
addBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Clear all tasks button
clearBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
        taskList.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY);
        updateStats();
    }
});

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    // Check if input is empty
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    // Create task object
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    // Add to DOM
    addTaskToDOM(task);
    
    // Save to local storage
    saveTasks();
    
    // Clear input field
    taskInput.value = '';
    taskInput.focus();
    
    // Update statistics
    updateStats();
}

// Add task to the DOM
function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }
    li.dataset.id = task.id;
    
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="checkbox" 
            ${task.completed ? 'checked' : ''}
        >
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn">Delete</button>
    `;
    
    // Toggle task completion
    const checkbox = li.querySelector('.checkbox');
    checkbox.addEventListener('change', function() {
        li.classList.toggle('completed');
        toggleTaskCompletion(task.id);
        updateStats();
    });
    
    // Delete task
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        li.remove();
        deleteTask(task.id);
        updateStats();
    });
    
    taskList.appendChild(li);
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
    }
}

// Delete a task
function deleteTask(taskId) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks));
}

// Get all tasks from local storage
function getTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
}

// Save all tasks to local storage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(li => {
        tasks.push({
            id: parseInt(li.dataset.id),
            text: li.querySelector('.task-text').textContent,
            completed: li.querySelector('.checkbox').checked
        });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasks() {
    const tasks = getTasks();
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one to get started! 🎯</div>';
        return;
    }
    
    taskList.innerHTML = '';
    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}

// Update statistics
function updateStats() {
    const tasks = getTasks();
    const completedCount = tasks.filter(t => t.completed).length;
    
    totalTasksSpan.textContent = `Total: ${tasks.length}`;
    completedTasksSpan.textContent = `Completed: ${completedCount}`;
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
