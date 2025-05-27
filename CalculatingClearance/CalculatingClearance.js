// Курс долара до гривні (буде оновлюватися з API)
let USD_TO_UAH = 37; // Значення за замовчуванням

// Тарифи та коефіцієнти для розрахунку
const TARIFFS = {
  customs: {
    petrol: 0.1,
    diesel: 0.12,
    hybrid: 0.08,
    electric: 0.05,
  },
  excise: {
    petrol: {
      base: 50,
      perLiter: 25,
    },
    diesel: {
      base: 75,
      perLiter: 30,
    },
    hybrid: {
      base: 25,
      perLiter: 15,
    },
    electric: {
      base: 0,
      perLiter: 0,
    },
  },
  vat: 0.2, // 20%
  pension: 0.02, // 2%
};

// Коефіцієнти залежно від року випуску
const YEAR_COEFFICIENTS = {
  getCoefficient(year) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age <= 3) return 1.0;
    if (age <= 5) return 1.2;
    if (age <= 8) return 1.5;
    if (age <= 15) return 2.0;
    return 2.5;
  },
};

// Коефіцієнти залежно від країни
const COUNTRY_COEFFICIENTS = {
  germany: 1.0,
  usa: 1.1,
  japan: 0.95,
  poland: 1.05,
  france: 1.0,
  italy: 1.0,
  other: 1.15,
};

// Коефіцієнти залежно від типу кузова
const BODY_TYPE_COEFFICIENTS = {
  sedan: 1.0,
  hatchback: 0.95,
  suv: 1.2,
  wagon: 1.05,
  coupe: 1.1,
  convertible: 1.3,
};

class ClearanceCalculator {
  constructor() {
    this.form = document.getElementById("clearanceForm");
    this.resultSection = document.getElementById("result");
    this.usdRateElement = document.getElementById("usdRate");
    this.refreshBtn = document.getElementById("refreshRate");
    this.initEventListeners();
    this.loadExchangeRate(); // Завантажуємо курс при ініціалізації
  }

  initEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateClearance();
    });

    // Обробник для кнопки оновлення курсу
    this.refreshBtn.addEventListener("click", () => {
      this.loadExchangeRate();
    });

    // Додаємо анімацію при введенні даних
    const inputs = this.form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("focus", this.handleInputFocus);
      input.addEventListener("blur", this.handleInputBlur);
      input.addEventListener("input", this.handleInputChange);
    });
  }

  handleInputFocus(e) {
    e.target.parentElement.classList.add("focused");
  }

  handleInputBlur(e) {
    e.target.parentElement.classList.remove("focused");
  }

  handleInputChange(e) {
    if (e.target.value) {
      e.target.parentElement.classList.add("filled");
    } else {
      e.target.parentElement.classList.remove("filled");
    }
  }

  calculateClearance() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Валідація даних
    if (!this.validateData(data)) {
      this.showError("Будь ласка, заповніть всі поля коректно");
      return;
    }

    // Показуємо анімацію завантаження
    this.showLoading();

    // Імітуємо затримку для ефекту
    setTimeout(() => {
      const result = this.performCalculation(data);
      this.displayResult(result);
      this.hideLoading();
    }, 1000);
  }

  validateData(data) {
    const requiredFields = [
      "country",
      "engineType",
      "engineVolume",
      "year",
      "carValue",
      "carType",
    ];

    for (let field of requiredFields) {
      if (!data[field]) return false;
    }

    const engineVolume = parseFloat(data.engineVolume);
    const year = parseInt(data.year);
    const carValue = parseFloat(data.carValue);

    if (engineVolume < 0.1 || engineVolume > 10) return false;
    if (year < 1990 || year > new Date().getFullYear()) return false;
    if (carValue < 1000) return false;

    return true;
  }

  performCalculation(data) {
    const carValueUAH = parseFloat(data.carValue) * USD_TO_UAH;
    const engineVolume = parseFloat(data.engineVolume);
    const year = parseInt(data.year);

    // Отримуємо коефіцієнти
    const countryCoeff = COUNTRY_COEFFICIENTS[data.country] || 1.15;
    const yearCoeff = YEAR_COEFFICIENTS.getCoefficient(year);
    const bodyTypeCoeff = BODY_TYPE_COEFFICIENTS[data.carType] || 1.0;

    // Базова вартість для розрахунків
    const baseValue = carValueUAH * countryCoeff * yearCoeff * bodyTypeCoeff;

    // Розрахунок митного збору
    const customsRate = TARIFFS.customs[data.engineType] || 0.1;
    const customsFee = baseValue * customsRate;

    // Розрахунок акцизного збору
    const exciseData = TARIFFS.excise[data.engineType];
    const exciseTax =
      (exciseData.base + engineVolume * exciseData.perLiter) *
      USD_TO_UAH *
      yearCoeff;

    // Розрахунок ПДВ (з митної вартості + акциз)
    const vatBase = baseValue + customsFee + exciseTax;
    const vat = vatBase * TARIFFS.vat;

    // Розрахунок пенсійного збору
    const pensionFee = baseValue * TARIFFS.pension;

    // Загальна сума
    const totalAmount = customsFee + exciseTax + vat + pensionFee;

    return {
      customsFee: Math.round(customsFee),
      exciseTax: Math.round(exciseTax),
      vat: Math.round(vat),
      pensionFee: Math.round(pensionFee),
      totalAmount: Math.round(totalAmount),
    };
  }

  displayResult(result) {
    // Оновлюємо значення в DOM
    document.getElementById("customsFee").textContent = this.formatCurrency(
      result.customsFee
    );
    document.getElementById("exciseTax").textContent = this.formatCurrency(
      result.exciseTax
    );
    document.getElementById("vat").textContent = this.formatCurrency(
      result.vat
    );
    document.getElementById("pensionFee").textContent = this.formatCurrency(
      result.pensionFee
    );
    document.getElementById("totalAmount").textContent = this.formatCurrency(
      result.totalAmount
    );

    // Показуємо секцію результатів
    this.resultSection.classList.remove("hidden");

    // Прокручуємо до результатів
    this.resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Додаємо анімацію до чисел
    this.animateNumbers();
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  animateNumbers() {
    const valueElements = this.resultSection.querySelectorAll(".value");

    valueElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.transform = "scale(1.1)";
        element.style.color = "#667eea";

        setTimeout(() => {
          element.style.transform = "scale(1)";
          element.style.color = "";
        }, 200);
      }, index * 100);
    });
  }

  showLoading() {
    const button = this.form.querySelector(".calculate-btn");
    const originalText = button.innerHTML;

    button.innerHTML = '<div class="loading"></div> Розраховуємо...';
    button.disabled = true;

    // Зберігаємо оригінальний текст для відновлення
    button.dataset.originalText = originalText;
  }

  hideLoading() {
    const button = this.form.querySelector(".calculate-btn");
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
  }

  showError(message) {
    // Створюємо елемент помилки
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        `;

    // Додаємо стилі для помилки
    errorDiv.style.cssText = `
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #fcc;
        `;

    // Видаляємо попередню помилку, якщо є
    const existingError = this.form.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Додаємо нову помилку
    this.form.appendChild(errorDiv);

    // Автоматично видаляємо через 5 секунд
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  async loadExchangeRate() {
    try {
      this.refreshBtn.classList.add("loading");
      this.usdRateElement.textContent = "Завантаження...";

      const response = await fetch("/api/exchange-rate");
      const data = await response.json();

      if (data.success) {
        USD_TO_UAH = data.rate;
        this.usdRateElement.textContent = `${data.rate.toFixed(2)} ₴`;
        this.usdRateElement.className = "currency-success";

        // Показуємо повідомлення про успішне оновлення
        this.showCurrencyMessage("Курс валют оновлено", "success");
      } else {
        throw new Error(data.message || "Помилка отримання курсу");
      }
    } catch (error) {
      console.error("Помилка завантаження курсу:", error);
      this.usdRateElement.textContent = `${USD_TO_UAH.toFixed(2)} ₴ (кеш)`;
      this.usdRateElement.className = "currency-error";
      this.showCurrencyMessage("Використовується збережений курс", "error");
    } finally {
      this.refreshBtn.classList.remove("loading");
    }
  }

  // Додати метод для показу повідомлень про курс:
  showCurrencyMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `currency-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            ${
              type === "success"
                ? "background: #28a745;"
                : "background: #dc3545;"
            }
        `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
  }
}

// Функція для переходу на головну сторінку
function goToHome() {
  // Можна змінити на потрібний URL
  window.location.href = "../public/index.html";
}

// Ініціалізація калькулятора після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
  new ClearanceCalculator();

  // Додаємо плавну анімацію появи
  const elements = document.querySelectorAll(".calculator-card, .info-card");
  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";

    setTimeout(() => {
      element.style.transition = "all 0.6s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 200);
  });
});

// Додаємо обробник для плавного скролу
document.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  const scrolled = window.pageYOffset;
  const parallax = scrolled * 0.5;

  header.style.transform = `translateY(${parallax}px)`;
});

// Додаємо ефект паралаксу для фонових фігур
window.addEventListener("mousemove", (e) => {
  const shapes = document.querySelectorAll(".floating-shape");
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.5;
    const xPos = (x - 0.5) * speed * 20;
    const yPos = (y - 0.5) * speed * 20;

    shape.style.transform = `translate(${xPos}px, ${yPos}px)`;
  });
});

// Додати CSS анімації для повідомлень
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
