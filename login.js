// Demo user accounts
const demoAccounts = [
    { username: 'admin2e', password: 'admin123', role: 'admin', name: 'Admin' },
    { username: 'user2e', password: 'user123', role: 'user', name: 'User' }
];

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const messageContainer = document.getElementById('messageContainer');
const demoButtons = document.querySelectorAll('.demo-btn');

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.innerHTML = type === 'password' ? 
        '<i class="fas fa-eye"></i>' : 
        '<i class="fas fa-eye-slash"></i>';
});

// Show message function
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    messageContainer.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic validation
    if (!username || !password) {
        showMessage('Please fill in all fields');
        return;
    }

    // Check credentials against demo accounts
    const user = demoAccounts.find(account => 
        account.username === username && account.password === password
    );

    if (user) {
        // Store user info in localStorage
        const userData = {
            username: user.username,
            role: user.role,
            name: user.name,
            isLoggedIn: true
        };
        localStorage.setItem('taskease_user', JSON.stringify(userData));

        // Show success message
        showMessage('Login successful! Redirecting...', 'success');

        // Redirect to main page after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showMessage('Invalid username or password');
    }
});

// Handle demo account buttons
demoButtons.forEach(button => {
    button.addEventListener('click', () => {
        const username = button.dataset.username;
        const password = button.dataset.password;
        
        usernameInput.value = username;
        passwordInput.value = password;
        
        // Trigger form submission
        const submitEvent = new Event('submit', { cancelable: true });
        loginForm.dispatchEvent(submitEvent);
    });
});

// Check if user is already logged in
window.addEventListener('load', () => {
    const userData = localStorage.getItem('taskease_user');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
            window.location.href = 'index.html';
        }
    }
});