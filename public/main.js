document.addEventListener("DOMContentLoaded", () => {
  const servicesList = document.getElementById("services-list");
  const contactForm = document.getElementById("contact-form");
  const navLinks = document.querySelector(".nav-links");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("nav");
  const header = document.querySelector("header");

  // **Послуги**
  const services = [
    { name: "Діагностика двигуна", icon: "fa-car" },
    { name: "Ремонт трансмісії", icon: "fa-cogs" },
    { name: "Заміна гальмівних дисків", icon: "fa-bolt" },
    { name: "Ремонт кондиціонера", icon: "fa-oil-can" },
    { name: "Заміна масла", icon: "fa-car-crash" },
    { name: "Ремонт підвіски", icon: "fa-car" },
    { name: "Заміна свічок запалювання", icon: "fa-cogs" },
    { name: "Покраска автомобіля", icon: "fa-bolt" },
    { name: "Ремонт електричних систем", icon: "fa-oil-can" },
    { name: "Охолодження двигуна", icon: "fa-car-crash" },
    { name: "Заміна фільтру", icon: "fa-car" },
    { name: "Ремонт стартера", icon: "fa-cogs" },
    { name: "Ремонт електродвигуна", icon: "fa-bolt" },
    { name: "Перевірка системи живлення", icon: "fa-oil-can" },
    { name: "Проблеми з акумулятором", icon: "fa-car-crash" },
    { name: "Ремонт вихлопної системи", icon: "fa-car" },
    { name: "Заміна ременя", icon: "fa-cogs" },
    { name: "Перевірка системи охолодження", icon: "fa-bolt" },
    { name: "Ремонт підшипників", icon: "fa-oil-can" },
    { name: "Ремонт системи підйому", icon: "fa-car-crash" },
    { name: "Ремонт рульового управління", icon: "fa-car" },
    { name: "Заміна гальмівної рідини", icon: "fa-cogs" },
    { name: "Ремонт паливної системи", icon: "fa-bolt" },
    { name: "Заміна амортизаторів", icon: "fa-oil-can" },
    { name: "Ремонт системи запалювання", icon: "fa-car-crash" },
    { name: "Проблеми з трансмісією", icon: "fa-car" },
    { name: "Ремонт кузова", icon: "fa-cogs" },
    { name: "Ремонт фар", icon: "fa-bolt" },
    { name: "Заміна гальмівних колодок", icon: "fa-oil-can" },
    { name: "Ремонт двигуна", icon: "fa-car-crash" },
    { name: "Ремонт системи випуску газів", icon: "fa-wrench" },
  ];

  if (servicesList) {
    services.forEach((service) => {
      const div = document.createElement("div");
      div.className = "service-card";
      div.innerHTML = `
        <i class="fas ${service.icon} service-icon"></i>
        <h3 class="service-title">${service.name}</h3>
      `;
      servicesList.appendChild(div);
    });
  }

  // Отримуємо контейнер для майстрів на сторінці
  const mastersContainer = document.querySelector(".masters-grid");

  if (mastersContainer) {
    // Очищаємо контейнер перед завантаженням нових даних
    mastersContainer.innerHTML = "";

    // Завантажуємо дані майстрів з файлу masters.json
    fetch("/masters.json")
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Перевірка, що дані отримано
        data.forEach((master) => {
          // Створюємо елемент для кожного майстра
          const masterCard = document.createElement("div");
          masterCard.classList.add("master-card");

          // Створюємо список послуг майстра
          const servicesList = master.services
            ? master.services.map((service) => `<li>${service}</li>`).join("")
            : '';

          // Наповнюємо картку майстра інформацією
          masterCard.innerHTML = `
            <h3>${master.fullname}</h3>
            <p><strong>Номер телефону:</strong> ${
              master.phone || "Не вказано"
            }</p>
            <p><strong>Район:</strong> ${master.district}</p>
            ${master.services ? `
              <p><strong>Послуги:</strong></p>
              <ul>${servicesList}</ul>
            ` : ''}
          `;

          // Додаємо картку в контейнер
          mastersContainer.appendChild(masterCard);
        });
      })
      .catch((error) => {
        console.error("Помилка при завантаженні даних:", error);
        // Можна додати повідомлення про помилку на сторінці
      });
  }


  // **Обробка форми контактів**
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Відмінити перезавантаження сторінки

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/api/submit-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message + " Ми зв'яжемося з вами протягом 15 хвилин.");
          contactForm.reset();
        } else {
          throw new Error(result.error || "Помилка при відправці заявки");
        }
      } catch (error) {
        alert(
          "Виникла помилка при відправці заявки. Будь ласка, спробуйте ще раз пізніше."
        );
        console.error("Помилка:", error);
      }
    });
  }

  // **Мобільна навігація**
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-active");
      burger.classList.toggle("toggle");
    });
  }

  // **Анімації при прокручуванні**
  const faders = document.querySelectorAll(".fade-in");
  const sliders = document.querySelectorAll(".slide-in");

  const appearOptions = {
    threshold: 0,
    rootMargin: "0px 0px -100px 0px",
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("appear");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach((fader) => appearOnScroll.observe(fader));
  sliders.forEach((slider) => appearOnScroll.observe(slider));

  // **Зміна стилю хедера при прокручуванні**
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // **Плавна прокрутка**
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(anchor.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Load masters on the main page
  const mastersContainerMainPage = document.getElementById("masters-container");
  if (mastersContainerMainPage) {
    fetch("/masters.json")
      .then((response) => response.json())
      .then((masters) => {
        masters.forEach((master) => {
          const masterElement = document.createElement("div");
          masterElement.className = "master-card";
          masterElement.innerHTML = `
            <h3>${master.fullname}</h3>
            <p>Телефон: ${master.phone || 'Не вказано'}</p>
            <p>Район: ${master.district}</p>
            <p>Послуги:</p>
            <ul>
              ${master.services.map(service => `<li>${service}</li>`).join('')}
            </ul>
          `;
          mastersContainerMainPage.appendChild(masterElement);
        });
      })
      .catch((error) => {
        console.error("Помилка при завантаженні майстрів:", error);
      });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const districtSelect = document.getElementById("district");
  const streetSelect = document.getElementById("street");

  let streetsData = {}; // Об'єкт для збереження завантажених даних

  // Функція для завантаження JSON
  async function loadStreets() {
    try {
      const response = await fetch("streets.json"); // Завантаження файлу
      streetsData = await response.json(); // Збереження даних у змінну
    } catch (error) {
      console.error("Помилка завантаження JSON:", error);
    }
  }

  // Викликаємо функцію завантаження при завантаженні сторінки
  loadStreets();

  // Подія при зміні району
  districtSelect.addEventListener("change", () => {
    const selectedDistrict = districtSelect.value;

    // Очищення списку вулиць
    streetSelect.innerHTML =
      '<option value="">Спочатку оберіть вулицю</option>';

    if (selectedDistrict && streetsData[selectedDistrict]) {
      // Додавання вулиць у список
      streetsData[selectedDistrict].forEach((street) => {
        const option = document.createElement("option");
        option.value = street;
        option.textContent = street;
        streetSelect.appendChild(option);
      });
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Кнопка для редагування профілю
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const editProfileForm = document.getElementById("edit-profile-form");
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userPhone = document.getElementById("user-phone");

  // Перемикач між переглядом профілю і його редагуванням
  editProfileBtn.addEventListener("click", function () {
    editProfileForm.style.display = "block";
    // Оскільки ми починаємо редагування, приховуємо профіль
    editProfileBtn.style.display = "none";
  });

  // Обробка форми редагування профілю
  const editProfile = document.getElementById("edit-profile");
  editProfile.addEventListener("submit", function (e) {
    e.preventDefault();
    // Оновлюємо дані на сторінці
    userName.textContent = document.getElementById("edit-name").value;
    userEmail.textContent = document.getElementById("edit-email").value;
    userPhone.textContent = document.getElementById("edit-phone").value;

    // Приховуємо форму редагування та повертаємо кнопку "Редагувати профіль"
    editProfileForm.style.display = "none";
    editProfileBtn.style.display = "block";
  });
});

//Статистика майстрів

// Функція для оновлення статистики
function updateMasterStats() {
  // Приклад динамічного оновлення
  document.getElementById("requests-count").textContent = "150"; // Приклад зміни кількості запитів
  document.getElementById("avg-response-time").textContent = "25 хвилин"; // Заміна середнього часу відповіді
  document.getElementById("positive-reviews").textContent = "97%"; // Заміна відсотка позитивних відгуків
}

// Оновлення статистики при завантаженні сторінки
window.onload = function () {
  updateMasterStats();
};
let userActions = []; // Масив для зберігання рухів і взаємодій користувача

// Відслідковуємо рух курсора
document.addEventListener("mousemove", (event) => {
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  // Зберігаємо дані про рух
  userActions.push({
    type: "mousemove",
    x: mouseX,
    y: mouseY,
    timestamp: new Date(),
  });
});

// Відслідковуємо кліки по елементах
document.addEventListener("click", (event) => {
  let element = event.target;
  userActions.push({
    type: "click",
    element: element.tagName,
    id: element.id,
    class: element.className,
    timestamp: new Date(),
  });
});

// Функція для відправки зібраних даних на сервер
function sendUserActionsToServer() {
  fetch("/api/track-actions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actions: userActions }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Дані на сервері:", data))
    .catch((error) => console.error("Помилка:", error));
}

// Відправляти дані на сервер кожні 30 секунд
setInterval(sendUserActionsToServer, 30000);
// Функція для отримання даних з сервера
async function fetchCursorData() {
  const response = await fetch("/api/get-cursor-data");
  const data = await response.json();
  return data;
}

// Створення графіка руху курсора
function createCursorChart(data) {
  const ctx = document.getElementById("cursorMovementChart").getContext("2d");

  // Мапуємо дані у формат, який Chart.js розуміє
  const coordinates = data.map((d) => ({ x: d.x, y: d.y }));

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Рух курсора",
          data: coordinates,
          backgroundColor: "rgba(75, 192, 192, 1)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          type: "linear",
          position: "left",
        },
      },
    },
  });
}

// Завантаження та візуалізація даних
async function loadAndVisualize() {
  const data = await fetchCursorData();
  createCursorChart(data);
}

loadAndVisualize();

//Заявки відправлення:
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Заявка успішно відправлена!");
        contactForm.reset();
      } else {
        alert("Сталася помилка при відправці заявки.");
      }
    } catch (error) {
      console.error("Помилка:", error);
    }
  });
}

// Відображення заявок та оновлення статусу
async function fetchApplications() {
  try {
    const response = await fetch("/api/applications");
    if (response.ok) {
      const applications = await response.json();
      const applicationList = document.getElementById("applicationList");

      applicationList.innerHTML = ""; // Очищення старого списку

      applications.forEach((app, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${app.name} - ${app.email} (${
          app.completed ? "Виконано" : "Невиконано"
        })`;

        const toggleButton = document.createElement("button");
        toggleButton.textContent = app.completed
          ? "Позначити як невиконане"
          : "Позначити як виконане";
        toggleButton.addEventListener("click", async () => {
          await fetch(`/api/update-application/${index}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ completed: !app.completed }),
          });
          fetchApplications(); // Оновлення списку після зміни статусу
        });

        listItem.appendChild(toggleButton);
        applicationList.appendChild(listItem);
      });
    } else {
      console.error("Не вдалося отримати заявки.");
    }
  } catch (error) {
    console.error("Помилка завантаження заявок:", error);
  }
}

// Виклик функції для завантаження заявок
fetchApplications();

// Cursor movement tracking
let cursorMovements = [];
let isTracking = true;

document.addEventListener('mousemove', (e) => {
  if (!isTracking) return;

  cursorMovements.push({
    x: e.clientX,
    y: e.clientY,
    timestamp: new Date().toISOString()
  });

  // Send cursor movements to server every 100 movements
  if (cursorMovements.length >= 100) {
    sendCursorMovements();
  }
});

function sendCursorMovements() {
  if (cursorMovements.length === 0) return;

  fetch('/api/save-cursor-movement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cursorMovements)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cursor movements saved:', data);
    cursorMovements = []; // Clear the array after sending
  })
  .catch(error => {
    console.error('Error saving cursor movements:', error);
  });
}

// Send remaining cursor movements when user leaves the page
window.addEventListener('beforeunload', sendCursorMovements);

// Create heatmap
function createHeatmap() {
  isTracking = false; // Stop tracking while creating heatmap

  fetch('/api/get-cursor-movement')
    .then(response => response.json())
    .then(data => {
      const heatmapInstance = h337.create({
        container: document.body,
        radius: 20,
        maxOpacity: .5,
        minOpacity: 0,
        blur: .75
      });

      const points = data.map(point => ({
        x: point.x,
        y: point.y,
        value: 1
      }));

      heatmapInstance.setData({
        max: 5,
        data: points
      });

      // Create a button to toggle heatmap visibility
      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Toggle Heatmap';
      toggleButton.style.position = 'fixed';
      toggleButton.style.top = '10px';
      toggleButton.style.right = '10px';
      toggleButton.style.zIndex = '9999';

      toggleButton.addEventListener('click', () => {
        const heatmapContainer = document.querySelector('.heatmap-canvas');
        if (heatmapContainer.style.display === 'none') {
          heatmapContainer.style.display = 'block';
          isTracking = false;
        } else {
          heatmapContainer.style.display = 'none';
          isTracking = true;
        }
      });

      document.body.appendChild(toggleButton);
    })
    .catch(error => {
      console.error('Error creating heatmap:', error);
    });
}

// Call createHeatmap when the page loads
window.addEventListener('load', createHeatmap);

