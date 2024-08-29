// Store users and sessions
let users = [];
let currentUser = null;

// Function to register a new user
function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username && password) {
        const userExists = users.find(user => user.username === username);

        if (userExists) {
            alert("Username already taken!");
        } else {
            users.push({ username, password });
            alert("Registration successful! Please log in.");
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
        }
    } else {
        alert("Please fill out both fields!");
    }
}

// Function to log in a user
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        currentUser = user;
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        alert("Login successful!");
        updateUI();
    } else {
        alert("Invalid username or password!");
    }
}

// Function to log out the user
function logout() {
    currentUser = null;
    alert("Logged out successfully!");
    updateUI();
}

// Function to update the UI based on authentication state
function updateUI() {
    if (currentUser) {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('logout-form').style.display = 'block';
        document.getElementById('post-form').style.display = 'block';
        document.getElementById('welcome-user').textContent = currentUser.username;
    } else {
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('logout-form').style.display = 'none';
        document.getElementById('post-form').style.display = 'none';
    }
}

// Initially update UI
updateUI();
