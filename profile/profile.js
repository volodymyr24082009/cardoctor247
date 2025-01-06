document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('profile-form');
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const masterFields = document.querySelectorAll('.master-field');
    const servicesList = document.getElementById('services-list');

    // Populate services list
    const services = [
        "Діагностика двигуна", "Ремонт трансмісії", "Заміна гальмівних дисків",
        "Ремонт кондиціонера", "Заміна масла", "Ремонт підвіски",
        "Заміна свічок запалювання", "Покраска автомобіля", "Ремонт електричних систем",
        "Охолодження двигуна", "Заміна фільтру", "Ремонт стартера",
        "Ремонт електродвигуна", "Перевірка системи живлення", "Проблеми з акумулятором",
        "Ремонт вихлопної системи", "Заміна ременя", "Перевірка системи охолодження",
        "Ремонт підшипників", "Ремонт системи підйому", "Ремонт рульового управління",
        "Заміна гальмівної рідини", "Ремонт паливної системи", "Заміна амортизаторів",
        "Ремонт системи запалювання", "Проблеми з трансмісією", "Ремонт кузова",
        "Ремонт фар", "Заміна гальмівних колодок", "Ремонт двигуна",
        "Ремонт системи випуску газів"
    ];

    services.forEach(service => {
        const label = document.createElement('label');
        label.className = 'service-item';
        label.innerHTML = `
            <input type="checkbox" name="services" value="${service}">
            <i class="fa fa-wrench"></i>
            <span>${service}</span>
        `;
        servicesList.appendChild(label);
    });

    // Handle user type change
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Show the form with animation
            form.classList.add('active');

            if (this.value === 'master') {
                masterFields.forEach(field => field.style.display = 'block');
            } else {
                masterFields.forEach(field => field.style.display = 'none');
            }
        });
    });

    // Load saved data from localStorage
    const savedData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (savedData.userType) {
        document.getElementById('fullname').value = savedData.fullname || '';
        document.getElementById('email').value = savedData.email || '';
        document.getElementById('password').value = savedData.password || '';
        document.getElementById('nickname').value = savedData.nickname || '';
        
        const userTypeRadio = document.querySelector(`input[name="userType"][value="${savedData.userType}"]`);
        if (userTypeRadio) {
            userTypeRadio.checked = true;
            form.classList.add('active');
        }

        if (savedData.userType === 'master') {
            document.getElementById('phone').value = savedData.phone || '';
            document.getElementById('district').value = savedData.district || '';
            if (savedData.services) {
                savedData.services.forEach(service => {
                    const checkbox = document.querySelector(`input[name="services"][value="${service}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            masterFields.forEach(field => field.style.display = 'block');
        } else {
            masterFields.forEach(field => field.style.display = 'none');
        }

        // Update profile display
        document.getElementById('profile-name').textContent = savedData.fullname || 'Користувач';
        document.getElementById('profile-type').textContent = savedData.userType === 'master' ? 'Майстер' : 'Користувач';
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userType = document.querySelector('input[name="userType"]:checked').value;
        const formData = {
            userType: userType,
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            nickname: document.getElementById('nickname').value
        };

        if (userType === 'master') {
            formData.phone = document.getElementById('phone').value;
            formData.district = document.getElementById('district').value;
            formData.services = Array.from(document.querySelectorAll('input[name="services"]:checked'))
                .map(checkbox => checkbox.value);
        }

        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(formData));

        // Update the profile display
        document.getElementById('profile-name').textContent = formData.fullname;
        document.getElementById('profile-type').textContent = 
            userType === 'master' ? 'Майстер' : 'Користувач';

        // Show success message
        showNotification('Профіль успішно оновлено!', 'success');
    });

    // Handle avatar upload
    document.getElementById('avatar-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Будь ласка, виберіть зображення (JPEG, PNG або GIF)', 'error');
            return;
        }

        // Create FileReader to read and display the image
        const reader = new FileReader();
        reader.onload = function(event) {
            // Update the profile image
            document.getElementById('profile-image').src = event.target.result;
            
            // Save the image data to localStorage
            const savedData = JSON.parse(localStorage.getItem('userProfile') || '{}');
            savedData.avatarImage = event.target.result;
            localStorage.setItem('userProfile', JSON.stringify(savedData));

            showNotification('Фото профілю оновлено', 'success');
        };
        reader.readAsDataURL(file);
    });

    // Helper function to show notifications
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Load profile image from localStorage if exists
    if (savedData.avatarImage) {
        document.getElementById('profile-image').src = savedData.avatarImage;
    }
     // Handle home button click
     document.getElementById('home-button').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/public/index.html';
    });
});
