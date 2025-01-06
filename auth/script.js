document.addEventListener('DOMContentLoaded', () => {
  function handleRegistrationSuccess() {
    window.location.href = "/public/index.html";
  }

  // User registration form
  document.getElementById("userForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const userData = {
      fullname: document.getElementById("userFullname").value,
      email: document.getElementById("userEmail").value,
      password: document.getElementById("userPassword").value,
      phone: document.getElementById("userPhone").value,
      district: document.getElementById("userDistrict").value,
      nickname: document.getElementById("userNickname").value,
      type: "user"
    };

    if (!userData.email || !userData.password) {
      alert("Будь ласка, заповніть email та пароль!");
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok) {
        handleRegistrationSuccess();
      }
    } catch (error) {
      console.error("Помилка при відправці запиту:", error);
      alert("Виникла помилка при реєстрації. Спробуйте ще раз.");
    }
  });

  // Master registration form
  document.getElementById("masterForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const masterData = {
      fullname: document.getElementById("masterFullname").value,
      email: document.getElementById("masterEmail").value,
      password: document.getElementById("masterPassword").value,
      phone: document.getElementById("masterPhone").value,
      district: document.getElementById("masterDistrict").value,
      nickname: document.getElementById("masterNickname").value,
      services: Array.from(document.querySelectorAll('#servicesContainer input[type="checkbox"]:checked')).map(input => input.name),
      type: "master"
    };

    if (!masterData.email || !masterData.password) {
      alert("Будь ласка, заповніть email та пароль!");
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masterData),
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok) {
        handleRegistrationSuccess();
      }
    } catch (error) {
      console.error("Помилка при відправці запиту:", error);
      alert("Виникла помилка при реєстрації. Спробуйте ще раз.");
    }
  });

  // Show/hide modals
  document.getElementById("chooseMaster").addEventListener("click", () => {
    document.getElementById("mainContainer").classList.add("hidden");
    document.getElementById("masterModal").style.display = "flex";
  });

  document.getElementById("chooseUser").addEventListener("click", () => {
    document.getElementById("mainContainer").classList.add("hidden");
    document.getElementById("userModal").style.display = "flex";
  });
});
// Приклад функції валідації форми
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#myForm");
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const errorContainer = document.querySelector("#errorMessages");

  form.addEventListener("submit", (event) => {
      event.preventDefault();
      errorContainer.innerHTML = ""; // Очищуємо попередні повідомлення

      const errors = [];
      
      // Перевірка імені
      if (nameInput.value.trim() === "") {
          errors.push("Ім'я не може бути порожнім.");
      } else if (nameInput.value.trim().length < 3) {
          errors.push("Ім'я має бути не менше 3 символів.");
      }

      // Перевірка email
      if (emailInput.value.trim() === "") {
          errors.push("Email не може бути порожнім.");
      } else if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
          errors.push("Введіть коректну адресу електронної пошти.");
      }

      // Перевірка пароля
      if (passwordInput.value.trim() === "") {
          errors.push("Пароль не може бути порожнім.");
      } else if (passwordInput.value.trim().length < 6) {
          errors.push("Пароль має бути не менше 6 символів.");
      }

      // Якщо є помилки, показуємо їх
      if (errors.length > 0) {
          errors.forEach((error) => {
              const errorElement = document.createElement("p");
              errorElement.textContent = error;
              errorElement.style.color = "red";
              errorContainer.appendChild(errorElement);
          });
      } else {
          // Якщо немає помилок, можна відправити форму
          alert("Форма успішно відправлена!");
          form.submit();
      }
  });
  
});


