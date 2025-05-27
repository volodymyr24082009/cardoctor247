// AutoCare.js - Планувальник технічного обслуговування

// База даних технічного обслуговування
const maintenanceDatabase = {
  // Японські марки
  toyota: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 100000,
      timing: 100000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  honda: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 100000,
      timing: 100000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  nissan: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 100000,
      timing: 100000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  mazda: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 100000,
      timing: 100000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },

  // Німецькі марки
  volkswagen: {
    intervals: {
      oil: 15000,
      filters: {
        air: 30000,
        fuel: 60000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 50000,
        discs: 100000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 120000,
      timing: 120000,
      suspension: 100000,
      tires: 60000,
      battery: 48000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.1,
      hybrid: 0.9,
      electric: 0.4,
    },
  },
  bmw: {
    intervals: {
      oil: 15000,
      filters: {
        air: 30000,
        fuel: 60000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 50000,
        discs: 100000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 120000,
      timing: 120000,
      suspension: 100000,
      tires: 60000,
      battery: 48000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.1,
      hybrid: 0.9,
      electric: 0.4,
    },
  },
  mercedes: {
    intervals: {
      oil: 15000,
      filters: {
        air: 30000,
        fuel: 60000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 50000,
        discs: 100000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 120000,
      timing: 120000,
      suspension: 100000,
      tires: 60000,
      battery: 48000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.1,
      hybrid: 0.9,
      electric: 0.4,
    },
  },
  audi: {
    intervals: {
      oil: 15000,
      filters: {
        air: 30000,
        fuel: 60000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 50000,
        discs: 100000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 120000,
      timing: 120000,
      suspension: 100000,
      tires: 60000,
      battery: 48000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.1,
      hybrid: 0.9,
      electric: 0.4,
    },
  },

  // Корейські марки
  hyundai: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 50000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 80000,
      timing: 90000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  kia: {
    intervals: {
      oil: 10000,
      filters: {
        air: 20000,
        fuel: 40000,
        cabin: 15000,
      },
      sparkPlugs: 50000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 60000,
        automatic: 40000,
      },
      coolant: 80000,
      timing: 90000,
      suspension: 80000,
      tires: 50000,
      battery: 36000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },

  // Американські марки
  ford: {
    intervals: {
      oil: 12000,
      filters: {
        air: 24000,
        fuel: 48000,
        cabin: 18000,
      },
      sparkPlugs: 50000,
      brakes: {
        pads: 45000,
        discs: 90000,
        fluid: 24000,
      },
      transmission: {
        manual: 80000,
        automatic: 50000,
      },
      coolant: 80000,
      timing: 100000,
      suspension: 90000,
      tires: 55000,
      battery: 42000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  chevrolet: {
    intervals: {
      oil: 12000,
      filters: {
        air: 24000,
        fuel: 48000,
        cabin: 18000,
      },
      sparkPlugs: 50000,
      brakes: {
        pads: 45000,
        discs: 90000,
        fluid: 24000,
      },
      transmission: {
        manual: 80000,
        automatic: 50000,
      },
      coolant: 80000,
      timing: 100000,
      suspension: 90000,
      tires: 55000,
      battery: 42000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },

  // Французькі марки
  renault: {
    intervals: {
      oil: 15000,
      filters: {
        air: 25000,
        fuel: 50000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 90000,
      timing: 120000,
      suspension: 90000,
      tires: 50000,
      battery: 42000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
  peugeot: {
    intervals: {
      oil: 15000,
      filters: {
        air: 25000,
        fuel: 50000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 40000,
        discs: 80000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 90000,
      timing: 120000,
      suspension: 90000,
      tires: 50000,
      battery: 42000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },

  // Чеські марки
  skoda: {
    intervals: {
      oil: 15000,
      filters: {
        air: 30000,
        fuel: 60000,
        cabin: 20000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 50000,
        discs: 100000,
        fluid: 20000,
      },
      transmission: {
        manual: 80000,
        automatic: 60000,
      },
      coolant: 120000,
      timing: 120000,
      suspension: 100000,
      tires: 60000,
      battery: 48000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.1,
      hybrid: 0.9,
      electric: 0.4,
    },
  },

  // Загальні налаштування для невідомих марок
  default: {
    intervals: {
      oil: 12000,
      filters: {
        air: 24000,
        fuel: 48000,
        cabin: 18000,
      },
      sparkPlugs: 60000,
      brakes: {
        pads: 45000,
        discs: 90000,
        fluid: 24000,
      },
      transmission: {
        manual: 80000,
        automatic: 50000,
      },
      coolant: 100000,
      timing: 100000,
      suspension: 90000,
      tires: 55000,
      battery: 42000,
    },
    multipliers: {
      petrol: 1.0,
      diesel: 1.2,
      hybrid: 0.8,
      electric: 0.3,
    },
  },
};

// Розширена база послуг з цінами
const serviceDatabase = {
  oil: {
    name: "Заміна моторної оліви",
    description: "Заміна моторної оліви та масляного фільтра",
    icon: "fas fa-oil-can",
    baseCost: 800,
    priority: "urgent",
  },
  "filters.air": {
    name: "Заміна повітряного фільтра",
    description: "Заміна фільтра повітря двигуна",
    icon: "fas fa-wind",
    baseCost: 300,
    priority: "soon",
  },
  "filters.fuel": {
    name: "Заміна паливного фільтра",
    description: "Заміна фільтра паливної системи",
    icon: "fas fa-gas-pump",
    baseCost: 450,
    priority: "soon",
  },
  "filters.cabin": {
    name: "Заміна салонного фільтра",
    description: "Заміна фільтра вентиляції салону",
    icon: "fas fa-air-freshener",
    baseCost: 250,
    priority: "planned",
  },
  sparkPlugs: {
    name: "Заміна свічок запалювання",
    description: "Заміна комплекту свічок запалювання",
    icon: "fas fa-bolt",
    baseCost: 600,
    priority: "soon",
  },
  "brakes.pads": {
    name: "Заміна гальмівних колодок",
    description: "Заміна передніх або задніх гальмівних колодок",
    icon: "fas fa-compact-disc",
    baseCost: 1200,
    priority: "urgent",
  },
  "brakes.discs": {
    name: "Заміна гальмівних дисків",
    description: "Заміна гальмівних дисків",
    icon: "fas fa-circle",
    baseCost: 2000,
    priority: "soon",
  },
  "brakes.fluid": {
    name: "Заміна гальмівної рідини",
    description: "Заміна гальмівної рідини в системі",
    icon: "fas fa-tint",
    baseCost: 400,
    priority: "planned",
  },
  "transmission.manual": {
    name: "Заміна оліви в МКПП",
    description: "Заміна трансмісійної оліви в механічній коробці",
    icon: "fas fa-cogs",
    baseCost: 600,
    priority: "planned",
  },
  "transmission.automatic": {
    name: "Заміна оліви в АКПП",
    description: "Заміна ATF в автоматичній коробці передач",
    icon: "fas fa-cogs",
    baseCost: 1200,
    priority: "soon",
  },
  coolant: {
    name: "Заміна охолоджуючої рідини",
    description: "Заміна антифризу в системі охолодження",
    icon: "fas fa-thermometer-half",
    baseCost: 800,
    priority: "planned",
  },
  timing: {
    name: "Заміна ременя ГРМ",
    description: "Заміна ременя газорозподільного механізму",
    icon: "fas fa-link",
    baseCost: 3500,
    priority: "urgent",
  },
  suspension: {
    name: "ТО підвіски",
    description: "Діагностика та ремонт підвіски",
    icon: "fas fa-car-crash",
    baseCost: 2500,
    priority: "soon",
  },
  tires: {
    name: "Заміна шин",
    description: "Заміна комплекту шин",
    icon: "fas fa-tire",
    baseCost: 4000,
    priority: "planned",
  },
  battery: {
    name: "Заміна акумулятора",
    description: "Заміна акумуляторної батареї",
    icon: "fas fa-battery-full",
    baseCost: 1500,
    priority: "soon",
  },
};

// Глобальні змінні
let currentCarData = null;
let analysisResults = null;

// Ініціалізація сторінки
document.addEventListener("DOMContentLoaded", function () {
  initializeForm();
  setupEventListeners();
});

// Ініціалізація форми
function initializeForm() {
  const form = document.getElementById("maintenanceForm");
  const currentYear = new Date().getFullYear();
  const yearInput = document.getElementById("carYear");

  if (yearInput) {
    yearInput.max = currentYear;
  }
}

// Налаштування обробників подій
function setupEventListeners() {
  const form = document.getElementById("maintenanceForm");
  const carBrandSelect = document.getElementById("carBrand");
  const carModelInput = document.getElementById("carModel");

  // Обробка форми
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Оновлення відображення автомобіля
  if (carBrandSelect) {
    carBrandSelect.addEventListener("change", updateCarDisplay);
  }

  if (carModelInput) {
    carModelInput.addEventListener("input", updateCarDisplay);
  }

  // Додавання ефекту ripple до кнопки
  const analyzeBtn = document.querySelector(".analyze-btn");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", createRippleEffect);
  }
}

// Оновлення відображення автомобіля
function updateCarDisplay() {
  const carBrand = document.getElementById("carBrand").value;
  const carModel = document.getElementById("carModel").value;
  const carDisplay = document.getElementById("carDisplay");
  const carStatus = document.getElementById("carStatus");
  const statusText = document.getElementById("statusText");

  if (carBrand && carModel) {
    const brandText = document.querySelector(
      `#carBrand option[value="${carBrand}"]`
    ).textContent;
    carDisplay.textContent = `${brandText} ${carModel}`;
    carStatus.className = "status-indicator";
    statusText.textContent = "Готовий до аналізу";
  } else {
    carDisplay.textContent = "Оберіть марку та модель";
    carStatus.className = "status-indicator";
    statusText.textContent = "Очікування";
  }
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

// Обробка відправки форми
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const carData = {
    brand: formData.get("carBrand"),
    model: formData.get("carModel"),
    year: parseInt(formData.get("carYear")),
    engineType: formData.get("engineType"),
    currentMileage: parseInt(formData.get("currentMileage")),
    lastService: parseInt(formData.get("lastService")) || 0,
    drivingStyle: formData.get("drivingStyle"),
    operatingConditions: formData.get("operatingConditions"),
  };

  // Валідація
  if (!validateCarData(carData)) {
    return;
  }

  // Показати індикатор завантаження
  showLoadingState();

  try {
    // Затримка для демонстрації
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Аналіз даних
    currentCarData = carData;
    analysisResults = analyzeMaintenanceNeeds(carData);

    // Відображення результатів
    displayResults(analysisResults);
    updateCarStatus(analysisResults);
  } catch (error) {
    console.error("Помилка аналізу:", error);
    showError("Виникла помилка під час аналізу. Спробуйте ще раз.");
  } finally {
    hideLoadingState();
  }
}

// Валідація даних автомобіля
function validateCarData(carData) {
  const errors = [];

  if (!carData.brand) {
    errors.push("Оберіть марку автомобіля");
  }

  if (!carData.model || carData.model.length < 2) {
    errors.push("Введіть модель автомобіля");
  }

  if (
    !carData.year ||
    carData.year < 1990 ||
    carData.year > new Date().getFullYear()
  ) {
    errors.push("Введіть коректний рік випуску");
  }

  if (!carData.currentMileage || carData.currentMileage < 0) {
    errors.push("Введіть поточний пробіг");
  }

  if (carData.lastService > carData.currentMileage) {
    errors.push("Пробіг останнього ТО не може перевищувати поточний пробіг");
  }

  if (errors.length > 0) {
    showError(errors.join("\n"));
    return false;
  }

  return true;
}

// Аналіз потреб технічного обслуговування
function analyzeMaintenanceNeeds(carData) {
  const brandData =
    maintenanceDatabase[carData.brand] || maintenanceDatabase.default;
  const intervals = brandData.intervals;
  const multiplier = brandData.multipliers[carData.engineType] || 1.0;

  // Коригування інтервалів залежно від умов експлуатації
  const conditionMultiplier = getConditionMultiplier(
    carData.drivingStyle,
    carData.operatingConditions
  );
  const carAge = new Date().getFullYear() - carData.year;
  const ageMultiplier = getAgeMultiplier(carAge);

  const adjustedIntervals = adjustIntervals(
    intervals,
    multiplier * conditionMultiplier * ageMultiplier
  );

  const tasks = [];

  // Аналіз кожного компонента
  checkComponent("oil", adjustedIntervals.oil, carData, tasks);
  checkComponent("filters.air", adjustedIntervals.filters.air, carData, tasks);
  checkComponent(
    "filters.fuel",
    adjustedIntervals.filters.fuel,
    carData,
    tasks
  );
  checkComponent(
    "filters.cabin",
    adjustedIntervals.filters.cabin,
    carData,
    tasks
  );
  checkComponent("sparkPlugs", adjustedIntervals.sparkPlugs, carData, tasks);
  checkComponent("brakes.pads", adjustedIntervals.brakes.pads, carData, tasks);
  checkComponent(
    "brakes.discs",
    adjustedIntervals.brakes.discs,
    carData,
    tasks
  );
  checkComponent(
    "brakes.fluid",
    adjustedIntervals.brakes.fluid,
    carData,
    tasks
  );

  // Перевірка коробки передач
  const transmissionType =
    carData.engineType === "electric" ? "manual" : "automatic";
  checkComponent(
    `transmission.${transmissionType}`,
    adjustedIntervals.transmission[transmissionType],
    carData,
    tasks
  );

  checkComponent("coolant", adjustedIntervals.coolant, carData, tasks);
  checkComponent("timing", adjustedIntervals.timing, carData, tasks);
  checkComponent("suspension", adjustedIntervals.suspension, carData, tasks);
  checkComponent("tires", adjustedIntervals.tires, carData, tasks);
  checkComponent("battery", adjustedIntervals.battery, carData, tasks);

  // Сортування завдань за пріоритетом
  const urgentTasks = tasks
    .filter((task) => task.urgency === "urgent")
    .sort((a, b) => a.kmOverdue - b.kmOverdue);
  const soonTasks = tasks
    .filter((task) => task.urgency === "soon")
    .sort((a, b) => a.kmUntilDue - b.kmUntilDue);
  const plannedTasks = tasks
    .filter((task) => task.urgency === "planned")
    .sort((a, b) => a.kmUntilDue - b.kmUntilDue);

  // Розрахунок загальної інформації
  const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);
  const nextServiceKm = Math.min(...tasks.map((task) => task.nextServiceKm));
  const carCondition = calculateCarCondition(
    urgentTasks.length,
    soonTasks.length,
    carAge,
    carData.currentMileage
  );

  return {
    urgent: urgentTasks,
    soon: soonTasks,
    planned: plannedTasks,
    summary: {
      totalCost,
      nextServiceKm,
      carCondition,
      totalTasks: tasks.length,
    },
  };
}

// Перевірка компонента
function checkComponent(componentKey, interval, carData, tasks) {
  const serviceInfo = serviceDatabase[componentKey];
  if (!serviceInfo) return;

  const lastServiceKm = carData.lastService;
  const currentKm = carData.currentMileage;
  const kmSinceLastService = currentKm - lastServiceKm;

  let nextServiceKm = lastServiceKm + interval;
  let kmUntilDue = nextServiceKm - currentKm;
  let kmOverdue = 0;

  let urgency = "planned";

  if (kmUntilDue <= 0) {
    urgency = "urgent";
    kmOverdue = Math.abs(kmUntilDue);
  } else if (kmUntilDue <= interval * 0.1) {
    // 10% до закінчення інтервалу
    urgency = "urgent";
  } else if (kmUntilDue <= interval * 0.25) {
    // 25% до закінчення інтервалу
    urgency = "soon";
  }

  // Спеціальні перевірки
  if (
    componentKey === "timing" &&
    currentKm > 80000 &&
    kmSinceLastService > interval * 0.8
  ) {
    urgency = "urgent";
  }

  if (componentKey === "oil" && kmSinceLastService > interval * 0.9) {
    urgency = "urgent";
  }

  if (componentKey.includes("brakes") && kmSinceLastService > interval * 0.85) {
    urgency = "urgent";
  }

  const cost = calculateServiceCost(
    serviceInfo.baseCost,
    carData.year,
    carData.brand,
    urgency
  );

  tasks.push({
    key: componentKey,
    name: serviceInfo.name,
    description: serviceInfo.description,
    icon: serviceInfo.icon,
    urgency,
    kmUntilDue,
    kmOverdue,
    nextServiceKm,
    cost,
    interval,
  });
}

// Коригування інтервалів
function adjustIntervals(intervals, multiplier) {
  const adjusted = JSON.parse(JSON.stringify(intervals)); // Deep copy

  function adjustObject(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        adjustObject(obj[key]);
      } else if (typeof obj[key] === "number") {
        obj[key] = Math.round(obj[key] * multiplier);
      }
    }
  }

  adjustObject(adjusted);
  return adjusted;
}

// Множник залежно від умов експлуатації
function getConditionMultiplier(drivingStyle, operatingConditions) {
  let multiplier = 1.0;

  // Стиль водіння
  switch (drivingStyle) {
    case "calm":
      multiplier *= 1.2;
      break;
    case "normal":
      multiplier *= 1.0;
      break;
    case "active":
      multiplier *= 0.8;
      break;
    case "aggressive":
      multiplier *= 0.6;
      break;
  }

  // Умови експлуатації
  switch (operatingConditions) {
    case "highway":
      multiplier *= 1.1;
      break;
    case "city":
      multiplier *= 0.8;
      break;
    case "mixed":
      multiplier *= 0.9;
      break;
    case "harsh":
      multiplier *= 0.6;
      break;
  }

  return multiplier;
}

// Множник залежно від віку автомобіля
function getAgeMultiplier(age) {
  if (age <= 3) return 1.2;
  if (age <= 7) return 1.0;
  if (age <= 12) return 0.8;
  return 0.6;
}

// Розрахунок вартості послуги
function calculateServiceCost(baseCost, carYear, carBrand, urgency) {
  let cost = baseCost;

  // Коригування за роком
  const carAge = new Date().getFullYear() - carYear;
  if (carAge > 10) {
    cost *= 1.2; // Старші автомобілі дорожчі в обслуговуванні
  } else if (carAge < 3) {
    cost *= 1.1; // Нові автомобілі також можуть бути дорожчими
  }

  // Коригування за маркою
  const premiumBrands = [
    "bmw",
    "mercedes",
    "audi",
    "lexus",
    "porsche",
    "jaguar",
    "land_rover",
  ];
  if (premiumBrands.includes(carBrand)) {
    cost *= 1.5;
  }

  // Коригування за терміновістю
  if (urgency === "urgent") {
    cost *= 1.1;
  }

  return Math.round(cost);
}

// Розрахунок стану автомобіля
function calculateCarCondition(urgentCount, soonCount, carAge, mileage) {
  let score = 100;

  // Зниження за термінові роботи
  score -= urgentCount * 15;

  // Зниження за роботи найближчим часом
  score -= soonCount * 5;

  // Зниження за вік
  if (carAge > 15) score -= 20;
  else if (carAge > 10) score -= 10;
  else if (carAge > 5) score -= 5;

  // Зниження за пробіг
  if (mileage > 300000) score -= 20;
  else if (mileage > 200000) score -= 15;
  else if (mileage > 150000) score -= 10;
  else if (mileage > 100000) score -= 5;

  score = Math.max(0, Math.min(100, score));

  if (score >= 85) return "Відмінний";
  if (score >= 70) return "Хороший";
  if (score >= 50) return "Задовільний";
  if (score >= 30) return "Потребує уваги";
  return "Критичний";
}

// Відображення результатів
function displayResults(results) {
  const resultsSection = document.getElementById("results");
  const placeholder = document.getElementById("resultsPlaceholder");

  if (placeholder) placeholder.style.display = "none";
  if (resultsSection) resultsSection.classList.remove("hidden");

  // Відображення завдань по категоріях
  displayTaskCategory("urgentTasks", results.urgent, "urgent");
  displayTaskCategory("soonTasks", results.soon, "soon");
  displayTaskCategory("plannedTasks", results.planned, "planned");

  // Оновлення лічильників
  updateCounters(results);

  // Оновлення загальної інформації
  updateSummary(results.summary);
}

// Відображення категорії завдань
function displayTaskCategory(containerId, tasks, priority) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="task-item">
        <div class="task-icon ${priority}">
          <i class="fas fa-check"></i>
        </div>
        <div class="task-content">
          <div class="task-title">Все в порядку</div>
          <div class="task-description">Немає завдань у цій категорії</div>
        </div>
      </div>
    `;
    return;
  }

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task, priority);
    container.appendChild(taskElement);
  });
}

// Створення елемента завдання
function createTaskElement(task, priority) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-item";

  let statusText = "";
  if (task.urgency === "urgent") {
    statusText =
      task.kmOverdue > 0
        ? `Прострочено на ${task.kmOverdue.toLocaleString()} км`
        : "Терміново";
  } else if (task.urgency === "soon") {
    statusText = `Через ${task.kmUntilDue.toLocaleString()} км`;
  } else {
    statusText = `Через ${task.kmUntilDue.toLocaleString()} км`;
  }

  taskDiv.innerHTML = `
    <div class="task-icon ${priority}">
      <i class="${task.icon}"></i>
    </div>
    <div class="task-content">
      <div class="task-title">${task.name}</div>
      <div class="task-description">${task.description}</div>
      <div class="task-details">
        <span><i class="fas fa-road"></i> ${statusText}</span>
        <span><i class="fas fa-hryvnia-sign"></i> ${task.cost.toLocaleString()} ₴</span>
        <span><i class="fas fa-calendar"></i> Інтервал: ${task.interval.toLocaleString()} км</span>
      </div>
    </div>
    <div class="task-priority ${priority}">${getPriorityText(
    task.urgency
  )}</div>
  `;

  return taskDiv;
}

// Отримання тексту пріоритету
function getPriorityText(urgency) {
  switch (urgency) {
    case "urgent":
      return "Терміново";
    case "soon":
      return "Найближчим часом";
    case "planned":
      return "Планово";
    default:
      return "Планово";
  }
}

// Оновлення лічильників
function updateCounters(results) {
  const urgentCount = document.getElementById("urgentCount");
  const soonCount = document.getElementById("soonCount");
  const plannedCount = document.getElementById("plannedCount");

  if (urgentCount) urgentCount.textContent = results.urgent.length;
  if (soonCount) soonCount.textContent = results.soon.length;
  if (plannedCount) plannedCount.textContent = results.planned.length;
}

// Оновлення загальної інформації
function updateSummary(summary) {
  const nextServiceKm = document.getElementById("nextServiceKm");
  const estimatedCost = document.getElementById("estimatedCost");
  const carCondition = document.getElementById("carCondition");

  if (nextServiceKm) {
    const kmToNext = summary.nextServiceKm - currentCarData.currentMileage;
    nextServiceKm.textContent =
      kmToNext > 0 ? `${kmToNext.toLocaleString()} км` : "Зараз";
  }

  if (estimatedCost) {
    estimatedCost.textContent = `${summary.totalCost.toLocaleString()} ₴`;
  }

  if (carCondition) {
    carCondition.textContent = summary.carCondition;
  }
}

// Оновлення статусу автомобіля
function updateCarStatus(results) {
  const carStatus = document.getElementById("carStatus");
  const statusText = document.getElementById("statusText");

  if (!carStatus || !statusText) return;

  const urgentCount = results.urgent.length;

  if (urgentCount > 0) {
    carStatus.className = "status-indicator critical";
    statusText.textContent = "Потребує уваги";
  } else if (results.soon.length > 0) {
    carStatus.className = "status-indicator warning";
    statusText.textContent = "Хороший стан";
  } else {
    carStatus.className = "status-indicator good";
    statusText.textContent = "Відмінний стан";
  }
}

// Показати стан завантаження
function showLoadingState() {
  const analyzeBtn = document.querySelector(".analyze-btn");
  if (!analyzeBtn) return;

  const btnText = analyzeBtn.querySelector(".btn-text");
  if (btnText) {
    btnText.innerHTML = '<div class="loading"></div> Аналізую...';
  }

  analyzeBtn.disabled = true;
}

// Приховати стан завантаження
function hideLoadingState() {
  const analyzeBtn = document.querySelector(".analyze-btn");
  if (!analyzeBtn) return;

  const btnText = analyzeBtn.querySelector(".btn-text");
  if (btnText) {
    btnText.textContent = "Проаналізувати стан";
  }

  analyzeBtn.disabled = false;
}

// Показати помилку
function showError(message) {
  alert(message); // В реальному проекті варто використовувати більш елегантний спосіб
}

// Навігація
function goToHome() {
  window.location.href = "../public/index.html"; // Заміна на реальний шлях до головної сторінки
  console.log("Перехід на головну сторінку");
}

function goToCalculator() {
  // Тут має бути логіка переходу на калькулятор
  console.log("Перехід на калькулятор");
}

// Додаткові утиліти
function formatNumber(number) {
  return number.toLocaleString("uk-UA");
}

function formatCurrency(amount) {
  return `${amount.toLocaleString("uk-UA")} ₴`;
}

// Експорт для відладки (опціонально)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    maintenanceDatabase,
    serviceDatabase,
    analyzeMaintenanceNeeds,
    calculateServiceCost,
  };
}
