// Task Management Class with Authentication
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.maxTaskLength = 100;
        this.maxDescLength = 500;
        this.currentUser = null;
        
        // Check authentication first
        this.checkAuthentication();
        this.loadTasks();
        this.initializeEventListeners();
        this.updateUI();
        this.setupInputValidation();
        this.initializeProfile();
    }

    // Check if user is authenticated
    checkAuthentication() {
        const userData = localStorage.getItem('taskease_user');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            this.currentUser = JSON.parse(userData);
            if (!this.currentUser.isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            window.location.href = 'login.html';
            return;
        }
    }

    // Initialize profile functionality
    initializeProfile() {
        if (!this.currentUser) return;

        // Update user display name in navbar
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = this.currentUser.name || this.currentUser.username;
        }

        // Profile button event
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProfileModal();
            });
        }

        // Logout button event
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Profile modal events
        const closeProfileModal = document.getElementById('closeProfileModal');
        const closeProfileBtn = document.getElementById('closeProfileBtn');
        const profileModal = document.getElementById('profileModal');

        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => this.closeProfileModal());
        }
        if (closeProfileBtn) {
            closeProfileBtn.addEventListener('click', () => this.closeProfileModal());
        }
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target.id === 'profileModal') {
                    this.closeProfileModal();
                }
            });
        }
    }

    // Open profile modal
    openProfileModal() {
        if (!this.currentUser) return;

        const profileModal = document.getElementById('profileModal');
        const profileUsername = document.getElementById('profileUsername');
        const profileName = document.getElementById('profileName');
        const profileRole = document.getElementById('profileRole');
        const profileLoginTime = document.getElementById('profileLoginTime');

        // Populate profile data
        if (profileUsername) profileUsername.textContent = this.currentUser.username;
        if (profileName) profileName.textContent = this.currentUser.name || 'N/A';
        if (profileRole) profileRole.textContent = this.currentUser.role || 'User';
        if (profileLoginTime) {
            const loginTime = new Date().toLocaleString();
            profileLoginTime.textContent = loginTime;
        }

        if (profileModal) {
            profileModal.style.display = 'block';
        }
    }

    // Close profile modal
    closeProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.style.display = 'none';
        }
    }

    // Logout function
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('taskease_user');
            window.location.href = 'login.html';
        }
    }

    // Setup input validation
    setupInputValidation() {
        const taskInput = document.getElementById('taskInput');
        const descInput = document.getElementById('taskDescription');
        
        // Add character counter for task name
        taskInput.addEventListener('input', () => {
            if (taskInput.value.length > this.maxTaskLength) {
                taskInput.value = taskInput.value.substring(0, this.maxTaskLength);
                this.showInputFeedback(taskInput, 'Maximum length reached');
            }
        });

        // Add character counter for description
        descInput.addEventListener('input', () => {
            if (descInput.value.length > this.maxDescLength) {
                descInput.value = descInput.value.substring(0, this.maxDescLength);
                this.showInputFeedback(descInput, 'Maximum length reached');
            }
        });
    }

    // Show input feedback
    showInputFeedback(element, message) {
        element.style.borderColor = '#DC3545';
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'input-feedback';
        feedbackDiv.textContent = message;
        feedbackDiv.style.color = '#DC3545';
        feedbackDiv.style.fontSize = '0.8rem';
        feedbackDiv.style.marginTop = '0.25rem';
        
        // Remove existing feedback if any
        const existingFeedback = element.parentNode.querySelector('.input-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        element.parentNode.appendChild(feedbackDiv);
        
        setTimeout(() => {
            element.style.borderColor = '';
            feedbackDiv.remove();
        }, 2000);
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        // Task input enter key
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTask();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.closest('.filter-btn').dataset.filter);
            });
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());

        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
    }

    // Add new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const descInput = document.getElementById('taskDescription');
        const taskName = taskInput.value.trim();
        const taskDesc = descInput.value.trim();

        // Validate task name
        if (!taskName) {
            this.showInputFeedback(taskInput, 'Task name cannot be empty');
            taskInput.focus();
            return;
        }

        if (taskName.length > this.maxTaskLength) {
            this.showInputFeedback(taskInput, `Task name cannot exceed ${this.maxTaskLength} characters`);
            taskInput.focus();
            return;
        }

        // Validate description length if provided
        if (taskDesc && taskDesc.length > this.maxDescLength) {
            this.showInputFeedback(descInput, `Description cannot exceed ${this.maxDescLength} characters`);
            descInput.focus();
            return;
        }

        // Create and add the task
        const task = {
            id: Date.now(),
            name: taskName,
            description: taskDesc,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: this.currentUser.username
        };

        // Add to beginning of list and update
        this.tasks.unshift(task);
        this.saveTasks();
        this.updateUI();

        // Clear inputs and show success feedback
        taskInput.value = '';
        descInput.value = '';
        taskInput.style.borderColor = '#28A745';
        setTimeout(() => {
            taskInput.style.borderColor = '';
        }, 1000);
        taskInput.focus();
    }

    // Delete task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.updateUI();
        }
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateUI();
        }
    }

    // Open edit modal
    openEditModal(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const modal = document.getElementById('editModal');
            const nameInput = document.getElementById('editTaskInput');
            const descInput = document.getElementById('editTaskDescription');

            nameInput.value = task.name;
            nameInput.dataset.taskId = id;
            descInput.value = task.description || '';

            modal.style.display = 'block';
            nameInput.focus();
        }
    }

    // Close edit modal
    closeModal() {
        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
    }

    // Save edited task
    saveEdit() {
        const nameInput = document.getElementById('editTaskInput');
        const descInput = document.getElementById('editTaskDescription');
        const id = parseInt(nameInput.dataset.taskId);
        const task = this.tasks.find(task => task.id === id);

        if (task && nameInput.value.trim()) {
            task.name = nameInput.value.trim();
            task.description = descInput.value.trim();
            this.saveTasks();
            this.updateUI();
            this.closeModal();
        }
    }

    // Set current filter
    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.updateUI();
    }

    // Filter tasks based on current filter
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Create HTML for a single task
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item' + (task.completed ? ' completed' : '');
        
        const checkboxHtml = task.completed ? 'checked' : '';
        const descriptionHtml = task.description ? 
            '<div class="task-description">' + this.escapeHtml(task.description) + '</div>' : '';
        
        taskElement.innerHTML = 
            '<input type="checkbox" class="task-checkbox" ' + checkboxHtml + '>' +
            '<div class="task-content">' +
                '<div class="task-title">' + this.escapeHtml(task.name) + '</div>' +
                descriptionHtml +
            '</div>' +
            '<div class="task-actions">' +
                '<button class="task-btn edit" title="Edit">' +
                    '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="task-btn delete" title="Delete">' +
                    '<i class="fas fa-trash-alt"></i>' +
                '</button>' +
            '</div>';

        // Add event listeners
        taskElement.querySelector('.task-checkbox').addEventListener('change', () => this.toggleTask(task.id));
        taskElement.querySelector('.edit').addEventListener('click', () => this.openEditModal(task.id));
        taskElement.querySelector('.delete').addEventListener('click', () => this.deleteTask(task.id));

        return taskElement;
    }

    // Update UI with current tasks
    updateUI() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Update task count
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const taskText = totalTasks === 1 ? 'task' : 'tasks';
        document.getElementById('taskCount').textContent = totalTasks + ' ' + taskText + ' • ' + completedTasks + ' completed';

        // Clear current list
        taskList.innerHTML = '';

        // Show empty state or tasks
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            taskList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            taskList.style.display = 'block';
            
            // Add filtered tasks
            filteredTasks.forEach(task => {
                taskList.appendChild(this.createTaskElement(task));
            });
        }
    }

    // Save tasks to localStorage (user-specific)
    saveTasks() {
        try {
            const storageKey = `taskease-tasks-${this.currentUser.username}`;
            localStorage.setItem(storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.warn('Could not save tasks to localStorage:', error);
        }
    }

    // Load tasks from localStorage (user-specific)
    loadTasks() {
        try {
            const storageKey = `taskease-tasks-${this.currentUser.username}`;
            const savedTasks = localStorage.getItem(storageKey);
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.warn('Could not load tasks from localStorage:', error);
            this.tasks = [];
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new TaskManager();
});