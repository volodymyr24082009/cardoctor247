// TireWear.js - Калькулятор зносу шин та гальмівних колодок

// База даних зносу шин
const tireWearDatabase = {
  thickness: {
    summer: {
      excellent: { min: 6, max: 20, color: "excellent" },
      good: { min: 3, max: 6, color: "good" },
      warning: { min: 1.6, max: 3, color: "warning" },
      critical: { min: 0, max: 1.6, color: "critical" },
    },
    winter: {
      excellent: { min: 6, max: 20, color: "excellent" },
      good: { min: 4, max: 6, color: "good" },
      warning: { min: 2, max: 4, color: "warning" },
      critical: { min: 0, max: 2, color: "critical" },
    },
    "all-season": {
      excellent: { min: 6, max: 20, color: "excellent" },
      good: { min: 3.5, max: 6, color: "good" },
      warning: { min: 2, max: 3.5, color: "warning" },
      critical: { min: 0, max: 2, color: "critical" },
    },
  },
  mileage: {
    premium: { max: 80000, multiplier: 1.0 },
    mid: { max: 65000, multiplier: 0.8 },
    budget: { max: 40000, multiplier: 0.6 },
  },
  conditions: {
    highway: 1.2,
    city: 0.8,
    mixed: 1.0,
    aggressive: 0.6,
  },
  ageMultiplier: {
    0: 1.0,
    3: 0.9,
    5: 0.8,
    7: 0.7,
    10: 0.5,
  },
};

// База даних зносу гальмівних колодок
const brakeWearDatabase = {
  thickness: {
    excellent: { min: 8, max: 20, color: "excellent" },
    good: { min: 5, max: 8, color: "good" },
    warning: { min: 3, max: 5, color: "warning" },
    critical: { min: 0, max: 3, color: "critical" },
  },
  mileage: {
    premium: { max: 70000, multiplier: 1.0 },
    mid: { max: 50000, multiplier: 0.8 },
    budget: { max: 30000, multiplier: 0.6 },
  },
  brakeType: {
    ceramic: 1.3,
    "semi-metallic": 1.0,
    organic: 0.8,
    metallic: 1.1,
  },
  position: {
    front: 0.7, // Передні зношуються швидше
    rear: 1.0,
  },
  weight: {
    light: 1.0,
    medium: 0.8,
    heavy: 0.6,
  },
  style: {
    smooth: 1.3,
    normal: 1.0,
    aggressive: 0.6,
    sport: 0.5,
  },
  terrain: {
    flat: 1.1,
    hilly: 0.9,
    mountain: 0.7,
  },
};

// База цін на компоненти
const priceDatabase = {
  tires: {
    budget: { min: 1500, max: 3000 },
    mid: { min: 3000, max: 6000 },
    premium: { min: 6000, max: 12000 },
  },
  brakes: {
    budget: { min: 800, max: 1500 },
    mid: { min: 1500, max: 3000 },
    premium: { min: 3000, max: 6000 },
  },
};

// Глобальні змінні
let currentCalculationType = null;
let currentResults = null;

// Ініціалізація сторінки
document.addEventListener("DOMContentLoaded", function () {
  initializeCalculators();
  setupEventListeners();
});

// Ініціалізація калькуляторів
function initializeCalculators() {
  // Встановлення початкових значень
  updateStatusWidget("Оберіть тип перевірки", "waiting");
}

// Налаштування обробників подій
function setupEventListeners() {
  // Обробники для перемикання методів
  const methodButtons = document.querySelectorAll(".method-btn");
  methodButtons.forEach((button) => {
    button.addEventListener("click", handleMethodSwitch);
  });

  // Обробники для кнопок розрахунку
  const calculateButtons = document.querySelectorAll(".calculate-btn");
  calculateButtons.forEach((button) => {
    button.addEventListener("click", createRippleEffect);
  });

  // Обробники для полів вводу
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("change", updateStatusWidget);
  });
}

// Обробка перемикання методів
function handleMethodSwitch(e) {
  const button = e.currentTarget;
  const method = button.dataset.method;
  const type = button.dataset.type;

  // Оновлення активної кнопки
  const container = button.closest(".method-buttons");
  container.querySelectorAll(".method-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");

  // Перемикання секцій
  const card = button.closest(".calculator-card");
  const sections = card.querySelectorAll(".input-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  const targetSection = card.querySelector(`#${type}-${method}`);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Оновлення статусу
  updateStatusWidget(
    `Метод: ${method === "thickness" ? "За товщиною" : "За пробігом"}`,
    "ready"
  );
}

// Створення ефекту ripple
function createRippleEffect(e) {
  const button = e.currentTarget;
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  ripple.classList.add("btn-ripple");

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Оновлення віджета статусу
function updateStatusWidget(message, status = "waiting") {
  const statusDisplay = document.getElementById("statusDisplay");
  const componentStatus = document.getElementById("componentStatus");
  const statusText = document.getElementById("statusText");

  if (statusDisplay) statusDisplay.textContent = message;

  if (componentStatus) {
    componentStatus.className = `status-indicator ${status}`;
  }

  if (statusText) {
    const statusTexts = {
      waiting: "Очікування",
      ready: "Готовий",
      excellent: "Відмінний",
      good: "Хороший",
      warning: "Увага",
      critical: "Критичний",
    };
    statusText.textContent = statusTexts[status] || "Очікування";
  }
}

// Розрахунок зносу шин
async function calculateTireWear() {
  const activeMethod = document.querySelector(".tire-card .method-btn.active")
    .dataset.method;

  showLoadingState("tire");

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let results;
    if (activeMethod === "thickness") {
      results = calculateTireWearByThickness();
    } else {
      results = calculateTireWearByMileage();
    }

    currentCalculationType = "tire";
    currentResults = results;

    displayResults(results);
    updateStatusWidget(`Шини: ${results.condition}`, results.status);
  } catch (error) {
    console.error("Помилка розрахунку зносу шин:", error);
    showError("Виникла помилка під час розрахунку. Перевірте введені дані.");
  } finally {
    hideLoadingState("tire");
  }
}

// Розрахунок зносу шин за товщиною
function calculateTireWearByThickness() {
  const thickness = parseFloat(document.getElementById("tireThickness").value);
  const tireType = document.getElementById("tireType").value;
  const tireSize = document.getElementById("tireSize").value;
  const tireBrand = document.getElementById("tireBrand").value;

  if (!thickness || thickness < 0) {
    throw new Error("Введіть коректну товщину протектора");
  }

  const thresholds = tireWearDatabase.thickness[tireType];
  let condition, status, wearPercentage;

  // Визначення стану
  if (thickness >= thresholds.excellent.min) {
    condition = "Відмінний";
    status = "excellent";
    wearPercentage = Math.max(0, 100 - ((20 - thickness) / 20) * 100);
  } else if (thickness >= thresholds.good.min) {
    condition = "Хороший";
    status = "good";
    wearPercentage =
      70 -
      ((thresholds.good.max - thickness) /
        (thresholds.good.max - thresholds.good.min)) *
        30;
  } else if (thickness >= thresholds.warning.min) {
    condition = "Потребує заміни";
    status = "warning";
    wearPercentage =
      40 -
      ((thresholds.warning.max - thickness) /
        (thresholds.warning.max - thresholds.warning.min)) *
        30;
  } else {
    condition = "Критичний стан";
    status = "critical";
    wearPercentage = Math.max(0, (thickness / thresholds.warning.min) * 10);
  }

  // Розрахунок залишкового ресурсу
  const remainingKm = calculateRemainingMileage(thickness, tireType);
  const replacementTime = calculateReplacementTime(remainingKm);
  const estimatedCost = calculateTireCost(tireBrand, tireSize);

  // Генерація рекомендацій
  const recommendations = generateTireRecommendations(
    thickness,
    tireType,
    status
  );

  return {
    type: "tire",
    method: "thickness",
    condition,
    status,
    wearPercentage: Math.round(wearPercentage),
    remainingKm,
    replacementTime,
    estimatedCost,
    recommendations,
    showWarning: status === "critical",
    details: {
      thickness,
      tireType,
      tireSize,
      tireBrand,
    },
  };
}

// Розрахунок зносу шин за пробігом
function calculateTireWearByMileage() {
  const mileage = parseInt(document.getElementById("tireMileage").value);
  const quality = document.getElementById("tireQuality").value;
  const conditions = document.getElementById("drivingConditions").value;
  const age = parseInt(document.getElementById("tireAge").value) || 0;

  if (!mileage || mileage < 0) {
    throw new Error("Введіть коректний пробіг");
  }

  const baseLifespan = tireWearDatabase.mileage[quality].max;
  const conditionMultiplier = tireWearDatabase.conditions[conditions];
  const ageMultiplier = getAgeMultiplier(age);

  const adjustedLifespan = baseLifespan * conditionMultiplier * ageMultiplier;
  const wearPercentage = Math.min(100, (mileage / adjustedLifespan) * 100);

  let condition, status;
  if (wearPercentage < 60) {
    condition = "Відмінний";
    status = "excellent";
  } else if (wearPercentage < 80) {
    condition = "Хороший";
    status = "good";
  } else if (wearPercentage < 95) {
    condition = "Потребує заміни";
    status = "warning";
  } else {
    condition = "Критичний стан";
    status = "critical";
  }

  const remainingKm = Math.max(0, adjustedLifespan - mileage);
  const replacementTime = calculateReplacementTime(remainingKm);
  const estimatedCost = calculateTireCost(quality);

  const recommendations = generateTireRecommendationsByMileage(
    wearPercentage,
    conditions,
    age
  );

  return {
    type: "tire",
    method: "mileage",
    condition,
    status,
    wearPercentage: Math.round(wearPercentage),
    remainingKm,
    replacementTime,
    estimatedCost,
    recommendations,
    showWarning: status === "critical",
    details: {
      mileage,
      quality,
      conditions,
      age,
      adjustedLifespan,
    },
  };
}

// Розрахунок зносу гальмівних колодок
async function calculateBrakeWear() {
  const activeMethod = document.querySelector(".brake-card .method-btn.active")
    .dataset.method;

  showLoadingState("brake");

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let results;
    if (activeMethod === "thickness") {
      results = calculateBrakeWearByThickness();
    } else {
      results = calculateBrakeWearByMileage();
    }

    currentCalculationType = "brake";
    currentResults = results;

    displayResults(results);
    updateStatusWidget(
      `Гальмівні колодки: ${results.condition}`,
      results.status
    );
  } catch (error) {
    console.error("Помилка розрахунку зносу колодок:", error);
    showError("Виникла помилка під час розрахунку. Перевірте введені дані.");
  } finally {
    hideLoadingState("brake");
  }
}

// Розрахунок зносу колодок за товщиною
function calculateBrakeWearByThickness() {
  const thickness = parseFloat(document.getElementById("brakeThickness").value);
  const brakeType = document.getElementById("brakeType").value;
  const position = document.getElementById("brakePosition").value;
  const weight = document.getElementById("vehicleWeight").value;

  if (!thickness || thickness < 0) {
    throw new Error("Введіть коректну товщину колодок");
  }

  const thresholds = brakeWearDatabase.thickness;
  let condition, status, wearPercentage;

  // Визначення стану
  if (thickness >= thresholds.excellent.min) {
    condition = "Відмінний";
    status = "excellent";
    wearPercentage = Math.max(0, 100 - ((20 - thickness) / 20) * 100);
  } else if (thickness >= thresholds.good.min) {
    condition = "Хороший";
    status = "good";
    wearPercentage =
      70 -
      ((thresholds.good.max - thickness) /
        (thresholds.good.max - thresholds.good.min)) *
        30;
  } else if (thickness >= thresholds.warning.min) {
    condition = "Потребує заміни";
    status = "warning";
    wearPercentage =
      40 -
      ((thresholds.warning.max - thickness) /
        (thresholds.warning.max - thresholds.warning.min)) *
        30;
  } else {
    condition = "Критичний стан";
    status = "critical";
    wearPercentage = Math.max(0, (thickness / thresholds.warning.min) * 10);
  }

  // Розрахунок залишкового ресурсу
  const remainingKm = calculateBrakeRemainingMileage(
    thickness,
    brakeType,
    position,
    weight
  );
  const replacementTime = calculateReplacementTime(remainingKm);
  const estimatedCost = calculateBrakeCost(brakeType, position);

  // Генерація рекомендацій
  const recommendations = generateBrakeRecommendations(
    thickness,
    brakeType,
    position,
    status
  );

  return {
    type: "brake",
    method: "thickness",
    condition,
    status,
    wearPercentage: Math.round(wearPercentage),
    remainingKm,
    replacementTime,
    estimatedCost,
    recommendations,
    showWarning: status === "critical",
    details: {
      thickness,
      brakeType,
      position,
      weight,
    },
  };
}

// Розрахунок зносу колодок за пробігом
function calculateBrakeWearByMileage() {
  const mileage = parseInt(document.getElementById("brakeMileage").value);
  const quality = document.getElementById("brakeQuality").value;
  const style = document.getElementById("brakingStyle").value;
  const terrain = document.getElementById("terrainType").value;

  if (!mileage || mileage < 0) {
    throw new Error("Введіть коректний пробіг");
  }

  const baseLifespan = brakeWearDatabase.mileage[quality].max;
  const styleMultiplier = brakeWearDatabase.style[style];
  const terrainMultiplier = brakeWearDatabase.terrain[terrain];

  const adjustedLifespan = baseLifespan * styleMultiplier * terrainMultiplier;
  const wearPercentage = Math.min(100, (mileage / adjustedLifespan) * 100);

  let condition, status;
  if (wearPercentage < 60) {
    condition = "Відмінний";
    status = "excellent";
  } else if (wearPercentage < 80) {
    condition = "Хороший";
    status = "good";
  } else if (wearPercentage < 95) {
    condition = "Потребує заміни";
    status = "warning";
  } else {
    condition = "Критичний стан";
    status = "critical";
  }

  const remainingKm = Math.max(0, adjustedLifespan - mileage);
  const replacementTime = calculateReplacementTime(remainingKm);
  const estimatedCost = calculateBrakeCost(quality);

  const recommendations = generateBrakeRecommendationsByMileage(
    wearPercentage,
    style,
    terrain
  );

  return {
    type: "brake",
    method: "mileage",
    condition,
    status,
    wearPercentage: Math.round(wearPercentage),
    remainingKm,
    replacementTime,
    estimatedCost,
    recommendations,
    showWarning: status === "critical",
    details: {
      mileage,
      quality,
      style,
      terrain,
      adjustedLifespan,
    },
  };
}

// Допоміжні функції розрахунку

function getAgeMultiplier(age) {
  if (age <= 3) return 1.0;
  if (age <= 5) return 0.9;
  if (age <= 7) return 0.8;
  if (age <= 10) return 0.7;
  return 0.5;
}

function calculateRemainingMileage(thickness, tireType) {
  const minThickness = tireWearDatabase.thickness[tireType].warning.min;
  const remainingThickness = Math.max(0, thickness - minThickness);

  // Приблизний розрахунок: 1 мм = 10,000 км
  return Math.round(remainingThickness * 10000);
}

function calculateBrakeRemainingMileage(
  thickness,
  brakeType,
  position,
  weight
) {
  const minThickness = brakeWearDatabase.thickness.warning.min;
  const remainingThickness = Math.max(0, thickness - minThickness);

  const typeMultiplier = brakeWearDatabase.brakeType[brakeType];
  const positionMultiplier = brakeWearDatabase.position[position];
  const weightMultiplier = brakeWearDatabase.weight[weight];

  // Приблизний розрахунок: 1 мм = 8,000 км з коригуваннями
  return Math.round(
    remainingThickness *
      8000 *
      typeMultiplier *
      positionMultiplier *
      weightMultiplier
  );
}

function calculateReplacementTime(remainingKm) {
  if (remainingKm <= 0) return "Негайно";
  if (remainingKm < 5000) return "1-2 місяці";
  if (remainingKm < 10000) return "3-4 місяці";
  if (remainingKm < 20000) return "6-8 місяців";
  return "Більше року";
}

function calculateTireCost(brand, size) {
  let basePrice = 3000;

  if (typeof brand === "string") {
    const premiumBrands = ["michelin", "bridgestone", "continental", "pirelli"];
    if (premiumBrands.includes(brand)) {
      basePrice = 6000;
    }
  } else {
    // Якщо передано якість замість бренду
    const prices = priceDatabase.tires[brand] || priceDatabase.tires.mid;
    basePrice = (prices.min + prices.max) / 2;
  }

  return Math.round(basePrice * 4); // Комплект з 4 шин
}

function calculateBrakeCost(type, position) {
  let basePrice = 1500;

  if (
    typeof type === "string" &&
    ["ceramic", "semi-metallic", "organic", "metallic"].includes(type)
  ) {
    if (type === "ceramic") basePrice = 3000;
    else if (type === "semi-metallic") basePrice = 2000;
    else if (type === "organic") basePrice = 1200;
    else if (type === "metallic") basePrice = 1800;
  } else {
    // Якщо передано якість
    const prices = priceDatabase.brakes[type] || priceDatabase.brakes.mid;
    basePrice = (prices.min + prices.max) / 2;
  }

  return Math.round(basePrice * 2); // Комплект на одну вісь
}

// Генерація рекомендацій

function generateTireRecommendations(thickness, tireType, status) {
  const recommendations = [];

  if (status === "critical") {
    recommendations.push({
      icon: "fas fa-exclamation-triangle",
      text: "Негайно припиніть експлуатацію та замініть шини",
    });
    recommendations.push({
      icon: "fas fa-road",
      text: "Їзда на таких шинах небезпечна, особливо в дощову погоду",
    });
  } else if (status === "warning") {
    recommendations.push({
      icon: "fas fa-calendar-alt",
      text: "Плануйте заміну шин найближчим часом",
    });
    recommendations.push({
      icon: "fas fa-tachometer-alt",
      text: "Уникайте швидкісної їзди та різких маневрів",
    });
  } else if (status === "good") {
    recommendations.push({
      icon: "fas fa-eye",
      text: "Регулярно перевіряйте глибину протектора",
    });
    recommendations.push({
      icon: "fas fa-sync-alt",
      text: "Міняйте шини місцями кожні 10,000 км",
    });
  } else {
    recommendations.push({
      icon: "fas fa-check-circle",
      text: "Шини в відмінному стані",
    });
    recommendations.push({
      icon: "fas fa-shield-alt",
      text: "Продовжуйте регулярне обслуговування",
    });
  }

  // Загальні рекомендації
  recommendations.push({
    icon: "fas fa-thermometer-half",
    text: "Перевіряйте тиск у шинах щомісяця",
  });

  if (tireType === "winter") {
    recommendations.push({
      icon: "fas fa-snowflake",
      text: "Зимові шини слід міняти при товщині менше 4 мм",
    });
  }

  return recommendations;
}

function generateTireRecommendationsByMileage(wearPercentage, conditions, age) {
  const recommendations = [];

  if (wearPercentage > 95) {
    recommendations.push({
      icon: "fas fa-exclamation-triangle",
      text: "Шини вичерпали свій ресурс - потрібна заміна",
    });
  } else if (wearPercentage > 80) {
    recommendations.push({
      icon: "fas fa-calendar-alt",
      text: "Почніть підбирати нові шини",
    });
  }

  if (conditions === "aggressive") {
    recommendations.push({
      icon: "fas fa-steering-wheel",
      text: "Змініть стиль водіння для збільшення ресурсу шин",
    });
  }

  if (age > 5) {
    recommendations.push({
      icon: "fas fa-clock",
      text: "Шини старше 5 років потребують особливої уваги",
    });
  }

  recommendations.push({
    icon: "fas fa-balance-scale",
    text: "Робіть балансування коліс кожні 15,000 км",
  });

  return recommendations;
}

function generateBrakeRecommendations(thickness, brakeType, position, status) {
  const recommendations = [];

  if (status === "critical") {
    recommendations.push({
      icon: "fas fa-exclamation-triangle",
      text: "НЕБЕЗПЕЧНО! Негайно замініть гальмівні колодки",
    });
    recommendations.push({
      icon: "fas fa-ban",
      text: "Уникайте інтенсивного гальмування",
    });
  } else if (status === "warning") {
    recommendations.push({
      icon: "fas fa-calendar-alt",
      text: "Замініть колодки протягом найближчих тижнів",
    });
    recommendations.push({
      icon: "fas fa-tools",
      text: "Перевірте стан гальмівних дисків",
    });
  } else if (status === "good") {
    recommendations.push({
      icon: "fas fa-eye",
      text: "Перевіряйте товщину колодок кожні 10,000 км",
    });
  } else {
    recommendations.push({
      icon: "fas fa-check-circle",
      text: "Гальмівні колодки в відмінному стані",
    });
  }

  if (position === "front") {
    recommendations.push({
      icon: "fas fa-info-circle",
      text: "Передні колодки зношуються швидше задніх",
    });
  }

  recommendations.push({
    icon: "fas fa-tint",
    text: "Перевіряйте рівень гальмівної рідини",
  });

  if (brakeType === "ceramic") {
    recommendations.push({
      icon: "fas fa-star",
      text: "Керамічні колодки служать довше та менше пилять",
    });
  }

  return recommendations;
}

function generateBrakeRecommendationsByMileage(wearPercentage, style, terrain) {
  const recommendations = [];

  if (wearPercentage > 95) {
    recommendations.push({
      icon: "fas fa-exclamation-triangle",
      text: "Колодки вичерпали свій ресурс",
    });
  } else if (wearPercentage > 80) {
    recommendations.push({
      icon: "fas fa-calendar-alt",
      text: "Плануйте заміну колодок",
    });
  }

  if (style === "aggressive" || style === "sport") {
    recommendations.push({
      icon: "fas fa-hand-paper",
      text: "Спробуйте більш плавне гальмування",
    });
  }

  if (terrain === "mountain") {
    recommendations.push({
      icon: "fas fa-mountain",
      text: "Гірська місцевість прискорює знос колодок",
    });
  }

  recommendations.push({
    icon: "fas fa-sync-alt",
    text: "Міняйте колодки парами (ліва + права)",
  });

  return recommendations;
}

// Відображення результатів

function displayResults(results) {
  const resultsContent = document.getElementById("results");
  const placeholder = document.getElementById("resultsPlaceholder");

  if (placeholder) placeholder.style.display = "none";
  if (resultsContent) resultsContent.classList.remove("hidden");

  // Оновлення назви компонента
  const componentName = document.getElementById("componentName");
  if (componentName) {
    componentName.textContent =
      results.type === "tire" ? "Стан шин" : "Стан гальмівних колодок";
  }

  // Оновлення прогрес-бару
  updateProgressBar(results);

  // Оновлення карток статусу
  updateStatusCards(results);

  // Відображення рекомендацій
  displayRecommendations(results.recommendations);

  // Показ попередження якщо потрібно
  const safetyWarning = document.getElementById("safetyWarning");
  if (safetyWarning) {
    if (results.showWarning) {
      safetyWarning.classList.remove("hidden");
    } else {
      safetyWarning.classList.add("hidden");
    }
  }
}

function updateProgressBar(results) {
  const progressFill = document.getElementById("progressFill");
  const wearPercentage = document.getElementById("wearPercentage");

  if (progressFill) {
    // Встановлення кольору залежно від стану
    let gradient;
    switch (results.status) {
      case "excellent":
        gradient = "var(--excellent-gradient)";
        break;
      case "good":
        gradient = "var(--good-gradient)";
        break;
      case "warning":
        gradient = "var(--warning-gradient)";
        break;
      case "critical":
        gradient = "var(--critical-gradient)";
        break;
      default:
        gradient = "var(--primary-gradient)";
    }

    progressFill.style.background = gradient;
    progressFill.style.width = `${results.wearPercentage}%`;
  }

  if (wearPercentage) {
    wearPercentage.textContent = `${results.wearPercentage}%`;
  }
}

function updateStatusCards(results) {
  // Стан
  const conditionIcon = document.getElementById("conditionIcon");
  const conditionText = document.getElementById("conditionText");

  if (conditionIcon && conditionText) {
    const icons = {
      excellent: "fas fa-check-circle",
      good: "fas fa-thumbs-up",
      warning: "fas fa-exclamation-triangle",
      critical: "fas fa-times-circle",
    };

    conditionIcon.innerHTML = `<i class="${icons[results.status]}"></i>`;
    conditionText.textContent = results.condition;
  }

  // Залишок ресурсу
  const remainingText = document.getElementById("remainingText");
  if (remainingText) {
    remainingText.textContent =
      results.remainingKm > 0
        ? `${results.remainingKm.toLocaleString()} км`
        : "Вичерпано";
  }

  // Заміна через
  const replacementText = document.getElementById("replacementText");
  if (replacementText) {
    replacementText.textContent = results.replacementTime;
  }

  // Вартість
  const costText = document.getElementById("costText");
  if (costText) {
    costText.textContent = `${results.estimatedCost.toLocaleString()} ₴`;
  }
}

function displayRecommendations(recommendations) {
  const recommendationList = document.getElementById("recommendationList");
  if (!recommendationList) return;

  recommendationList.innerHTML = "";

  recommendations.forEach((recommendation, index) => {
    const item = document.createElement("div");
    item.className = "recommendation-item";
    item.style.animationDelay = `${index * 0.1}s`;

    item.innerHTML = `
      <div class="recommendation-icon">
        <i class="${recommendation.icon}"></i>
      </div>
      <div class="recommendation-text">
        ${recommendation.text}
      </div>
    `;

    recommendationList.appendChild(item);
  });
}

// Стани завантаження

function showLoadingState(type) {
  const button = document.querySelector(`.${type}-btn`);
  if (!button) return;

  const btnText = button.querySelector(".btn-text");
  if (btnText) {
    btnText.innerHTML = '<div class="loading"></div> Розраховую...';
  }

  button.disabled = true;
}

function hideLoadingState(type) {
  const button = document.querySelector(`.${type}-btn`);
  if (!button) return;

  const btnText = button.querySelector(".btn-text");
  if (btnText) {
    const originalText =
      type === "tire" ? "Розрахувати знос шин" : "Розрахувати знос колодок";
    btnText.textContent = originalText;
  }

  button.disabled = false;
}

function showError(message) {
  alert(message); // В реальному проекті варто використовувати більш елегантний спосіб
}

// Навігація

function goToHome() {
    window.location.href = "./TireWear.js"; // Заміна на реальний шлях до головної сторінки
  console.log("Перехід на головну сторінку");
  // Тут має бути логіка переходу
}

function goToMaintenance() {
  console.log("Перехід на планувальник ТО");
  // Тут має бути логіка переходу
}

// Експорт для відладки (опціонально)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    tireWearDatabase,
    brakeWearDatabase,
    calculateTireWearByThickness,
    calculateBrakeWearByThickness,
  };
}
