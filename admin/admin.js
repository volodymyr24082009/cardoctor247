// Global variables to store data
let users = [];
let masters = [];
let analytics = {
    totalUsers: 0,
    totalMasters: 0,
    successfulServices: 0,
    unsuccessfulServices: 0
};

// Function for logging into the admin panel
function login() {
    const password = document.getElementById('password').value;
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const errorMessage = document.getElementById('errorMessage');

    if (password === '319560') {
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
        loadData();
    } else {
        errorMessage.textContent = 'Невірний пароль';
    }
}

// Function for loading data
async function loadData() {
    try {
        // Loading users
        const usersResponse = await fetch('/data/users.json');
        users = await usersResponse.json();

        // Loading masters
        const mastersResponse = await fetch('/data/masters.json');
        masters = await mastersResponse.json();

        // Updating analytics
        updateAnalytics();
        
        // Displaying data
        displayUsers();
        displayMasters();
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
    }
}

// Function for updating analytics
function updateAnalytics() {
    analytics = {
        totalUsers: users.length,
        totalMasters: masters.length,
       
    };

    // Updating statistics display
    document.getElementById('totalUsers').textContent = analytics.totalUsers;
    document.getElementById('totalMasters').textContent = analytics.totalMasters;

}

// Function for displaying users
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullname || 'Не вказано'}</td>
            <td>${user.email}</td>
            <td>Користувач</td>
            
        `;
        tbody.appendChild(row);
    });
}

// Function for displaying masters
function displayMasters() {
    const tbody = document.getElementById('mastersTableBody');
    tbody.innerHTML = '';

    masters.forEach(master => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${master.fullname || 'Не вказано'}</td>
            <td>${master.email}</td>
            <td>${master.services.join(', ') || 'Не вказано'}</td>
           
        `;
        tbody.appendChild(row);
    });
}

// Function for switching tabs
function showTab(tabName) {
    // Updating active button
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');

    // Displaying corresponding content
    document.getElementById('usersTab').style.display = tabName === 'users' ? 'block' : 'none';
    document.getElementById('mastersTab').style.display = tabName === 'masters' ? 'block' : 'none';
}


// Automatic data update every 30 seconds
setInterval(loadData, 30000);