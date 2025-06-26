document.addEventListener('DOMContentLoaded', () => {
    // === Seleksi Elemen DOM ===
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const menuBtn = document.getElementById('menu-btn');
    const menuOptions = document.getElementById('menu-options');
    const downloadBtn = document.getElementById('download-btn');

    // === State Aplikasi ===
    // Coba ambil 'todos' dari local storage, jika tidak ada, gunakan array kosong
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all'; // Filter awal adalah 'all'

    // === Fungsi-Fungsi ===

    // Fungsi untuk menyimpan tugas ke Local Storage
    const saveToLocalStorage = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Fungsi untuk me-render (menampilkan) daftar tugas ke layar
    const renderTasks = () => {
        taskList.innerHTML = ''; // Kosongkan daftar sebelum render ulang

        // Filter tugas berdasarkan 'currentFilter'
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'complete') {
                return todo.completed;
            }
            if (currentFilter === 'incomplete') {
                return !todo.completed;
            }
            return true; // untuk filter 'all'
        });

        if (filteredTodos.length === 0) {
            taskList.innerHTML = '<li class="task-item" style="justify-content: center; color: #888;">No tasks found.</li>';
            return;
        }

        filteredTodos.forEach(todo => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            taskItem.setAttribute('data-id', todo.id);

            // Tambahkan kelas 'completed' jika tugas sudah selesai
            if (todo.completed) {
                taskItem.classList.add('completed');
            }

            // Struktur HTML untuk setiap item tugas
            taskItem.innerHTML = `
                <div class="check-circle">${todo.completed ? 'X' : ''}</div>
                <span class="task-text">${todo.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;

            taskList.appendChild(taskItem);
        });
    };

    // Fungsi untuk menambah tugas baru
    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(), // ID unik berdasarkan timestamp
            text: taskText,
            completed: false
        };

        todos.push(newTask);
        taskInput.value = ''; // Kosongkan input field
        
        saveToLocalStorage();
        renderTasks();
    };
    
    // Fungsi untuk menangani klik pada daftar tugas (untuk complete atau delete)
    const handleTaskListClick = (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = Number(taskItem.getAttribute('data-id'));

        // Jika tombol hapus yang diklik
        if (target.closest('.delete-btn')) {
            // Hapus tugas dari array 'todos'
            todos = todos.filter(todo => todo.id !== taskId);
        } 
        // Jika lingkaran cek yang diklik
        else if (target.closest('.check-circle')) {
            // Cari tugas dan ubah status 'completed'
            const todo = todos.find(todo => todo.id === taskId);
            if (todo) {
                todo.completed = !todo.completed;
            }
        }

        saveToLocalStorage();
        renderTasks();
    };

    // Fungsi untuk menghapus semua tugas
    const clearAllTasks = () => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            todos = [];
            saveToLocalStorage();
            renderTasks();
        }
    };
    
    // Fungsi untuk toggle menu
    const toggleMenu = () => {
        menuOptions.classList.toggle('show');
    };

    // Fungsi untuk menangani klik pada opsi menu
    const handleMenuOptionClick = (e) => {
        if (e.target.tagName === 'LI') {
            const filter = e.target.getAttribute('data-filter');
            if (filter) {
                currentFilter = filter;
                renderTasks();
            }
            menuOptions.classList.remove('show');
        }
    };

    // === Event Listeners ===

    // Tambah tugas saat tombol '+' diklik atau tombol 'Enter' ditekan
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event listener untuk daftar tugas (menggunakan event delegation)
    taskList.addEventListener('click', handleTaskListClick);

    // Hapus semua tugas
    clearAllBtn.addEventListener('click', clearAllTasks);

    // Buka/tutup menu
    menuBtn.addEventListener('click', toggleMenu);
    
    // Tutup menu jika klik di luar area menu
    window.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !menuOptions.contains(e.target)) {
            menuOptions.classList.remove('show');
        }
    });

    // Event listener untuk opsi menu
    menuOptions.addEventListener('click', handleMenuOptionClick);

    // Event listener untuk tombol "Download (Save)"
    downloadBtn.addEventListener('click', () => {
        saveToLocalStorage();
        alert('Your to-do list has been saved to local storage!');
        menuOptions.classList.remove('show');
    });

    // Render tugas pertama kali saat halaman dimuat
    renderTasks();
});