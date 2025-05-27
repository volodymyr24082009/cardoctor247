// Enhanced Fuel Calculator Pro
class FuelCalculatorPro {
  constructor() {
    this.history =
      JSON.parse(localStorage.getItem("fuelCalculatorHistory")) || [];
    this.settings = JSON.parse(
      localStorage.getItem("fuelCalculatorSettings")
    ) || {
      theme: "light",
      autoCalculate: true,
      currency: "грн",
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupParticles();
    this.loadHistory();
    this.setupAutoCalculate();
    this.showWelcomeToast();
  }

  setupEventListeners() {
    // Theme toggle
    document
      .getElementById("theme-toggle")
      .addEventListener("click", () => this.toggleTheme());

    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.tab)
      );
    });

    // Calculate buttons
    document
      .getElementById("calculate")
      .addEventListener("click", () => this.calculateBasic());
    document
      .getElementById("calculate-adv")
      .addEventListener("click", () => this.calculateAdvanced());

    // Auto calculate checkbox
    document.getElementById("auto-calc").addEventListener("change", (e) => {
      this.settings.autoCalculate = e.target.checked;
      this.saveSettings();
      this.setupAutoCalculate();
    });

    // Save result button
    document
      .getElementById("save-result")
      .addEventListener("click", () => this.saveCurrentResult());

    // Clear history button
    document
      .getElementById("clear-history")
      .addEventListener("click", () => this.clearHistory());

    // Input validation and formatting
    this.setupInputValidation();

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );
  }

  setupInputValidation() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => {
      input.addEventListener("input", (e) => this.validateInput(e.target));
      input.addEventListener("blur", (e) => this.formatInput(e.target));
    });
  }

  validateInput(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;

    if (value < min) {
      input.setCustomValidity(`Значення повинно бути не менше ${min}`);
      this.showToast(`Мінімальне значення: ${min}`, "warning");
    } else if (value > max) {
      input.setCustomValidity(`Значення повинно бути не більше ${max}`);
      this.showToast(`Максимальне значення: ${max}`, "warning");
    } else {
      input.setCustomValidity("");
    }

    // Auto calculate if enabled
    if (this.settings.autoCalculate && this.isFormValid()) {
      this.debounce(() => {
        const activeTab = document.querySelector(".tab-content.active").id;
        if (activeTab === "basic-tab") {
          this.calculateBasic();
        } else {
          this.calculateAdvanced();
        }
      }, 500)();
    }
  }

  formatInput(input) {
    if (input.value) {
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        const step = parseFloat(input.step) || 1;
        const decimals = step < 1 ? 2 : 0;
        input.value = value.toFixed(decimals);
      }
    }
  }

  setupAutoCalculate() {
    const autoCalcCheckbox = document.getElementById("auto-calc");
    autoCalcCheckbox.checked = this.settings.autoCalculate;
  }

  isFormValid() {
    const activeTab = document.querySelector(".tab-content.active").id;
    let inputs;

    if (activeTab === "basic-tab") {
      inputs = ["distance", "price", "consumption"];
    } else {
      inputs = ["distance-adv", "price-adv", "consumption-adv"];
    }

    return inputs.every((id) => {
      const input = document.getElementById(id);
      const value = parseFloat(input.value);
      return !isNaN(value) && value > 0;
    });
  }

  calculateBasic() {
    const distance = parseFloat(document.getElementById("distance").value);
    const price = parseFloat(document.getElementById("price").value);
    const consumption = parseFloat(
      document.getElementById("consumption").value
    );

    if (!this.validateCalculationInputs(distance, price, consumption)) {
      return;
    }

    this.showLoading();

    setTimeout(() => {
      const results = this.performCalculation({
        distance,
        price,
        consumption,
        speed: 60, // Default speed
        passengers: 1,
      });

      this.displayResults(results);
      this.hideLoading();
      this.showToast("Розрахунок завершено успішно!", "success");
    }, 800);
  }

  calculateAdvanced() {
    const distance = parseFloat(document.getElementById("distance-adv").value);
    const price = parseFloat(document.getElementById("price-adv").value);
    const consumption = parseFloat(
      document.getElementById("consumption-adv").value
    );
    const speed = parseFloat(document.getElementById("speed").value) || 60;
    const passengers =
      parseInt(document.getElementById("passengers").value) || 1;

    if (!this.validateCalculationInputs(distance, price, consumption)) {
      return;
    }

    this.showLoading();

    setTimeout(() => {
      const results = this.performCalculation({
        distance,
        price,
        consumption,
        speed,
        passengers,
      });

      this.displayResults(results, true);
      this.hideLoading();
      this.showToast("Детальний розрахунок завершено!", "success");
    }, 1000);
  }

  validateCalculationInputs(distance, price, consumption) {
    if (isNaN(distance) || isNaN(price) || isNaN(consumption)) {
      this.showToast(
        "Будь ласка, введіть коректні числові значення у всі поля",
        "error"
      );
      return false;
    }

    if (distance <= 0 || price <= 0 || consumption <= 0) {
      this.showToast("Всі значення повинні бути більше нуля", "error");
      return false;
    }

    if (distance > 10000) {
      this.showToast("Відстань занадто велика (максимум 10,000 км)", "warning");
      return false;
    }

    if (consumption > 50) {
      this.showToast("Споживання палива здається занадто високим", "warning");
    }

    return true;
  }

  performCalculation({ distance, price, consumption, speed, passengers }) {
    // Basic calculations
    const fuelNeeded = (distance / 100) * consumption;
    const totalCost = fuelNeeded * price;
    const costPerPerson = totalCost / passengers;
    const travelTime = distance / speed;
    const efficiency = totalCost / distance;

    // CO2 emissions calculation (approximate)
    const co2Emissions = fuelNeeded * 2.31; // kg CO2 per liter of gasoline

    // Efficiency rating (0-100)
    let efficiencyRating;
    if (consumption <= 5) efficiencyRating = 100;
    else if (consumption <= 7) efficiencyRating = 80;
    else if (consumption <= 10) efficiencyRating = 60;
    else if (consumption <= 15) efficiencyRating = 40;
    else efficiencyRating = 20;

    return {
      distance,
      price,
      consumption,
      speed,
      passengers,
      fuelNeeded,
      totalCost,
      costPerPerson,
      travelTime,
      efficiency,
      co2Emissions,
      efficiencyRating,
      timestamp: new Date(),
    };
  }

  displayResults(results, isAdvanced = false) {
    const resultCard = document.getElementById("result");

    // Update result values
    document.getElementById(
      "total-cost"
    ).textContent = `${results.totalCost.toFixed(2)} ${this.settings.currency}`;
    document.getElementById(
      "fuel-needed"
    ).textContent = `${results.fuelNeeded.toFixed(2)} л`;
    document.getElementById(
      "co2-emissions"
    ).textContent = `${results.co2Emissions.toFixed(1)} кг`;
    document.getElementById(
      "efficiency"
    ).textContent = `${results.efficiency.toFixed(2)} ${
      this.settings.currency
    }/км`;

    // Show/hide advanced results
    const timeResult = document.getElementById("time-result");
    const perPersonResult = document.getElementById("per-person-result");

    if (isAdvanced) {
      timeResult.style.display = "flex";
      perPersonResult.style.display = "flex";
      document.getElementById(
        "travel-time"
      ).textContent = `${results.travelTime.toFixed(1)} год`;
      document.getElementById(
        "cost-per-person"
      ).textContent = `${results.costPerPerson.toFixed(2)} ${
        this.settings.currency
      }`;
    } else {
      timeResult.style.display = "none";
      perPersonResult.style.display = "none";
    }

    // Update efficiency progress
    this.updateEfficiencyProgress(results.efficiencyRating);

    // Store current result for saving
    this.currentResult = results;

    // Show result card with animation
    resultCard.classList.remove("hidden");
    resultCard.style.animation = "fadeInUp 0.5s ease";
  }

  updateEfficiencyProgress(rating) {
    const progressFill = document.getElementById("efficiency-progress");
    const progressText = document.getElementById("efficiency-text");

    progressFill.style.width = `${rating}%`;

    let text, color;
    if (rating >= 80) {
      text = "Відмінна економічність";
      color = "#48bb78";
    } else if (rating >= 60) {
      text = "Хороша економічність";
      color = "#38b2ac";
    } else if (rating >= 40) {
      text = "Середня економічність";
      color = "#ed8936";
    } else {
      text = "Потребує покращення";
      color = "#e53e3e";
    }

    progressText.textContent = text;
    progressFill.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
  }

  saveCurrentResult() {
    if (!this.currentResult) {
      this.showToast("Немає результату для збереження", "warning");
      return;
    }

    this.history.unshift(this.currentResult);

    // Keep only last 20 results
    if (this.history.length > 20) {
      this.history = this.history.slice(0, 20);
    }

    this.saveHistory();
    this.loadHistory();
    this.showToast("Результат збережено в історію", "success");
  }

  loadHistory() {
    const historyList = document.getElementById("history-list");

    if (this.history.length === 0) {
      historyList.innerHTML = `
                <div class="history-empty">
                    <span class="empty-icon">📝</span>
                    <p>Історія розрахунків порожня</p>
                </div>
            `;
      return;
    }

    historyList.innerHTML = this.history
      .map(
        (result) => `
            <div class="history-item">
                <div class="history-item-header">
                    <strong>${result.distance} км • ${result.totalCost.toFixed(
          2
        )} ${this.settings.currency}</strong>
                    <span class="history-date">${this.formatDate(
                      result.timestamp
                    )}</span>
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <span class="history-detail-label">Споживання:</span>
                        <span class="history-detail-value">${
                          result.consumption
                        } л/100км</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Ціна палива:</span>
                        <span class="history-detail-value">${result.price} ${
          this.settings.currency
        }/л</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Витрата палива:</span>
                        <span class="history-detail-value">${result.fuelNeeded.toFixed(
                          2
                        )} л</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">CO₂ викиди:</span>
                        <span class="history-detail-value">${result.co2Emissions.toFixed(
                          1
                        )} кг</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  clearHistory() {
    if (this.history.length === 0) {
      this.showToast("Історія вже порожня", "warning");
      return;
    }

    if (confirm("Ви впевнені, що хочете очистити всю історію?")) {
      this.history = [];
      this.saveHistory();
      this.loadHistory();
      this.showToast("Історію очищено", "success");
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");

    // Hide results when switching tabs
    document.getElementById("result").classList.add("hidden");
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    this.settings.theme = newTheme;
    this.saveSettings();

    this.showToast(
      `Тему змінено на ${newTheme === "dark" ? "темну" : "світлу"}`,
      "success"
    );
  }

  setupTheme() {
    document.documentElement.setAttribute("data-theme", this.settings.theme);
  }

  setupParticles() {
    const container = document.getElementById("particles-container");
    const particleCount = window.innerWidth < 768 ? 20 : 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      const size = Math.random() * 4 + 2;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const duration = Math.random() * 3 + 3;
      const delay = Math.random() * 2;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;

      container.appendChild(particle);
    }
  }

  showLoading() {
    document.getElementById("loading-overlay").classList.remove("hidden");
  }

  hideLoading() {
    document.getElementById("loading-overlay").classList.add("hidden");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-message">${message}</div>`;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = "slideInRight 0.3s ease reverse";
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  showWelcomeToast() {
    setTimeout(() => {
      this.showToast("Ласкаво просимо до Fuel Calculator Pro! 🚗", "success");
    }, 1000);
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          const activeTab = document.querySelector(".tab-content.active").id;
          if (activeTab === "basic-tab") {
            this.calculateBasic();
          } else {
            this.calculateAdvanced();
          }
          break;
        case "s":
          e.preventDefault();
          this.saveCurrentResult();
          break;
        case "d":
          e.preventDefault();
          this.toggleTheme();
          break;
      }
    }
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  saveHistory() {
    localStorage.setItem("fuelCalculatorHistory", JSON.stringify(this.history));
  }

  saveSettings() {
    localStorage.setItem(
      "fuelCalculatorSettings",
      JSON.stringify(this.settings)
    );
  }
}

// Initialize the calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FuelCalculatorPro();
});

// Service Worker registration for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Handle online/offline status
window.addEventListener("online", () => {
  document.querySelector(".calculator-card").style.opacity = "1";
  new FuelCalculatorPro().showToast("З'єднання відновлено", "success");
});

window.addEventListener("offline", () => {
  document.querySelector(".calculator-card").style.opacity = "0.7";
  new FuelCalculatorPro().showToast(
    "Відсутнє з'єднання з інтернетом",
    "warning"
  );
});

// Handle window resize for responsive particles
window.addEventListener("resize", () => {
  const container = document.getElementById("particles-container");
  if (container) {
    container.innerHTML = "";
    setTimeout(() => {
      new FuelCalculatorPro().setupParticles();
    }, 100);
  }
});
// Enhanced Animated Fuel Calculator Pro
class AnimatedFuelCalculator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('fuelCalculatorHistory')) || [];
        this.settings = JSON.parse(localStorage.getItem('fuelCalculatorSettings')) || {
            theme: 'light',
            autoCalculate: true,
            currency: 'грн',
            animations: true
        };
        
        this.currentResult = null;
        this.animationQueue = [];
        this.isCalculating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupParticles();
        this.loadHistory();
        this.setupAutoCalculate();
        this.setupAnimations();
        this.showWelcomeSequence();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Calculate buttons
        document.getElementById('calculate').addEventListener('click', () => this.calculateBasic());
        document.getElementById('calculate-adv').addEventListener('click', () => this.calculateAdvanced());

        // Auto calculate checkbox
        document.getElementById('auto-calc').addEventListener('change', (e) => {
            this.settings.autoCalculate = e.target.checked;
            this.saveSettings();
            this.setupAutoCalculate();
            this.showToast('Автоматичний розрахунок ' + (e.target.checked ? 'увімкнено' : 'вимкнено'), 'success');
        });

        // Save result button
        document.getElementById('save-result').addEventListener('click', () => this.saveCurrentResult());

        // Clear history button
        document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());

        // Input validation and formatting
        this.setupInputValidation();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Button ripple effects
        this.setupRippleEffects();

        // Intersection Observer for animations
        this.setupScrollAnimations();
    }

    setupRippleEffects() {
        document.querySelectorAll('button, .home-button').forEach(button => {
            button.addEventListener('click', (e) => this.createRipple(e));
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'btn-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        const existingRipple = button.querySelector('.btn-ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.calculator-card, .result-card, .history-section, .tips-section').forEach(el => {
            observer.observe(el);
        });
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.validateInput(e.target));
            input.addEventListener('blur', (e) => this.formatInput(e.target));
            input.addEventListener('focus', (e) => this.animateInputFocus(e.target));
            
            // Stagger input animations
            input.style.animationDelay = `${index * 0.1}s`;
        });
    }

    animateInputFocus(input) {
        const wrapper = input.closest('.input-wrapper');
        const icon = wrapper.parentElement.querySelector('.icon');
        
        if (icon) {
            icon.style.animation = 'iconWiggle 0.5s ease-in-out';
            setTimeout(() => {
                icon.style.animation = '';
            }, 500);
        }
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;

        // Remove previous validation classes
        input.classList.remove('input-error', 'input-success');

        if (input.value && !isNaN(value)) {
            if (value < min) {
                input.setCustomValidity(`Значення повинно бути не менше ${min}`);
                input.classList.add('input-error');
                this.showToast(`Мінімальне значення: ${min}`, 'warning');
            } else if (value > max) {
                input.setCustomValidity(`Значення повинно бути не більше ${max}`);
                input.classList.add('input-error');
                this.showToast(`Максимальне значення: ${max}`, 'warning');
            } else {
                input.setCustomValidity('');
                input.classList.add('input-success');
            }
        } else {
            input.setCustomValidity('');
        }

        // Auto calculate if enabled
        if (this.settings.autoCalculate && this.isFormValid() && !this.isCalculating) {
            this.debounce(() => {
                const activeTab = document.querySelector('.tab-content.active').id;
                if (activeTab === 'basic-tab') {
                    this.calculateBasic();
                } else {
                    this.calculateAdvanced();
                }
            }, 800)();
        }
    }

    formatInput(input) {
        if (input.value) {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                const step = parseFloat(input.step) || 1;
                const decimals = step < 1 ? 2 : 0;
                input.value = value.toFixed(decimals);
            }
        }
    }

    setupAutoCalculate() {
        const autoCalcCheckbox = document.getElementById('auto-calc');
        autoCalcCheckbox.checked = this.settings.autoCalculate;
    }

    isFormValid() {
        const activeTab = document.querySelector('.tab-content.active').id;
        let inputs;
        
        if (activeTab === 'basic-tab') {
            inputs = ['distance', 'price', 'consumption'];
        } else {
            inputs = ['distance-adv', 'price-adv', 'consumption-adv'];
        }

        return inputs.every(id => {
            const input = document.getElementById(id);
            const value = parseFloat(input.value);
            return !isNaN(value) && value > 0;
        });
    }

    async calculateBasic() {
        if (this.isCalculating) return;
        
        const distance = parseFloat(document.getElementById('distance').value);
        const price = parseFloat(document.getElementById('price').value);
        const consumption = parseFloat(document.getElementById('consumption').value);

        if (!this.validateCalculationInputs(distance, price, consumption)) {
            return;
        }

        this.isCalculating = true;
        await this.showLoadingAnimation();

        setTimeout(async () => {
            const results = this.performCalculation({
                distance,
                price,
                consumption,
                speed: 90, // Default speed
                passengers: 1
            });

            await this.displayResults(results);
            this.hideLoading();
            this.isCalculating = false;
            this.showToast('Розрахунок завершено успішно! 🎉', 'success');
        }, 1200);
    }

    async calculateAdvanced() {
        if (this.isCalculating) return;
        
        const distance = parseFloat(document.getElementById('distance-adv').value);
        const price = parseFloat(document.getElementById('price-adv').value);
        const consumption = parseFloat(document.getElementById('consumption-adv').value);
        const speed = parseFloat(document.getElementById('speed').value) || 90;
        const passengers = parseInt(document.getElementById('passengers').value) || 1;

        if (!this.validateCalculationInputs(distance, price, consumption)) {
            return;
        }

        this.isCalculating = true;
        await this.showLoadingAnimation();

        setTimeout(async () => {
            const results = this.performCalculation({
                distance,
                price,
                consumption,
                speed,
                passengers
            });

            await this.displayResults(results, true);
            this.hideLoading();
            this.isCalculating = false;
            this.showToast('Детальний розрахунок завершено! 📊', 'success');
        }, 1500);
    }

    validateCalculationInputs(distance, price, consumption) {
        if (isNaN(distance) || isNaN(price) || isNaN(consumption)) {
            this.showToast('Будь ласка, введіть коректні числові значення у всі поля', 'error');
            this.shakeForm();
            return false;
        }

        if (distance <= 0 || price <= 0 || consumption <= 0) {
            this.showToast('Всі значення повинні бути більше нуля', 'error');
            this.shakeForm();
            return false;
        }

        if (distance > 10000) {
            this.showToast('Відстань занадто велика (максимум 10,000 км)', 'warning');
            return false;
        }

        if (consumption > 50) {
            this.showToast('Споживання палива здається занадто високим', 'warning');
        }

        return true;
    }

    shakeForm() {
        const form = document.querySelector('.calculator-form');
        form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }

    performCalculation({ distance, price, consumption, speed, passengers }) {
        // Basic calculations
        const fuelNeeded = (distance / 100) * consumption;
        const totalCost = fuelNeeded * price;
        const costPerPerson = totalCost / passengers;
        const travelTime = distance / speed;
        const efficiency = totalCost / distance;

        // CO2 emissions calculation (approximate)
        const co2Emissions = fuelNeeded * 2.31; // kg CO2 per liter of gasoline

        // Efficiency rating (0-100)
        let efficiencyRating;
        if (consumption <= 5) efficiencyRating = 100;
        else if (consumption <= 7) efficiencyRating = 85;
        else if (consumption <= 10) efficiencyRating = 70;
        else if (consumption <= 15) efficiencyRating = 50;
        else if (consumption <= 20) efficiencyRating = 30;
        else efficiencyRating = 15;

        return {
            distance,
            price,
            consumption,
            speed,
            passengers,
            fuelNeeded,
            totalCost,
            costPerPerson,
            travelTime,
            efficiency,
            co2Emissions,
            efficiencyRating,
            timestamp: new Date()
        };
    }

    async displayResults(results, isAdvanced = false) {
        const resultCard = document.getElementById('result');
        
        // Animate result values with counting effect
        await this.animateValue('total-cost', 0, results.totalCost, 1500, (value) => `${value.toFixed(2)}`);
        await this.animateValue('fuel-needed', 0, results.fuelNeeded, 1200, (value) => `${value.toFixed(2)}`);
        await this.animateValue('co2-emissions', 0, results.co2Emissions, 1000, (value) => `${value.toFixed(1)}`);
        await this.animateValue('efficiency', 0, results.efficiency, 800, (value) => `${value.toFixed(2)}`);

        // Show/hide advanced results with animation
        const timeResult = document.getElementById('time-result');
        const perPersonResult = document.getElementById('per-person-result');
        
        if (isAdvanced) {
            timeResult.style.display = 'flex';
            perPersonResult.style.display = 'flex';
            
            await this.animateValue('travel-time', 0, results.travelTime, 600, (value) => `${value.toFixed(1)}`);
            await this.animateValue('cost-per-person', 0, results.costPerPerson, 400, (value) => `${value.toFixed(2)}`);
        } else {
            timeResult.style.display = 'none';
            perPersonResult.style.display = 'none';
        }

        // Update efficiency progress with animation
        await this.updateEfficiencyProgress(results.efficiencyRating);

        // Store current result for saving
        this.currentResult = results;

        // Show result card with staggered animation
        resultCard.classList.remove('hidden');
        
        // Animate result items
        const resultItems = resultCard.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'resultItemSlideIn 0.6s ease-out forwards';
        });
    }

    async animateValue(elementId, start, end, duration, formatter) {
        return new Promise(resolve => {
            const element = document.querySelector(`#${elementId} .value-number`);
            if (!element) {
                resolve();
                return;
            }

            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const currentValue = start + (end - start) * easeOutCubic;
                
                element.textContent = formatter(currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    async updateEfficiencyProgress(rating) {
        const progressFill = document.getElementById('efficiency-progress');
        const progressText = document.getElementById('efficiency-text');
        
        // Animate progress bar
        progressFill.style.width = '0%';
        
        setTimeout(() => {
            progressFill.style.width = `${rating}%`;
        }, 100);
        
        let text, color;
        if (rating >= 85) {
            text = 'Відмінна економічність! 🌟';
            color = '#10b981';
        } else if (rating >= 70) {
            text = 'Хороша економічність 👍';
            color = '#059669';
        } else if (rating >= 50) {
            text = 'Середня економічність ⚖️';
            color = '#f59e0b';
        } else if (rating >= 30) {
            text = 'Потребує покращення 📈';
            color = '#ef4444';
        } else {
            text = 'Дуже високе споживання ⚠️';
            color = '#dc2626';
        }
        
        // Animate text change
        progressText.style.opacity = '0';
        setTimeout(() => {
            progressText.textContent = text;
            progressText.style.opacity = '1';
        }, 300);
        
        progressFill.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    }

    saveCurrentResult() {
        if (!this.currentResult) {
            this.showToast('Немає результату для збереження', 'warning');
            return;
        }

        this.history.unshift(this.currentResult);
        
        // Keep only last 20 results
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.loadHistory();
        this.showToast('Результат збережено в історію! 💾', 'success');
        
        // Animate save button
        const saveBtn = document.getElementById('save-result');
        saveBtn.style.animation = 'saveSuccess 0.6s ease-out';
        setTimeout(() => {
            saveBtn.style.animation = '';
        }, 600);
    }

    loadHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <div class="empty-animation">
                        <span class="empty-icon">📝</span>
                        <div class="empty-circles">
                            <div class="circle"></div>
                            <div class="circle"></div>
                            <div class="circle"></div>
                        </div>
                    </div>
                    <p>Історія розрахунків порожня</p>
                    <span class="empty-hint">Виконайте перший розрахунок, щоб побачити історію</span>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history.map((result, index) => `
            <div class="history-item" style="animation-delay: ${index * 0.1}s">
                <div class="history-item-header">
                    <strong>${result.distance} км • ${result.totalCost.toFixed(2)} ${this.settings.currency}</strong>
                    <span class="history-date">${this.formatDate(result.timestamp)}</span>
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <span class="history-detail-label">Споживання:</span>
                        <span class="history-detail-value">${result.consumption} л/100км</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Ціна палива:</span>
                        <span class="history-detail-value">${result.price} ${this.settings.currency}/л</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Витрата палива:</span>
                        <span class="history-detail-value">${result.fuelNeeded.toFixed(2)} л</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">CO₂ викиди:</span>
                        <span class="history-detail-value">${result.co2Emissions.toFixed(1)} кг</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (this.history.length === 0) {
            this.showToast('Історія вже порожня', 'warning');
            return;
        }

        if (confirm('Ви впевнені, що хочете очистити всю історію?')) {
            // Animate history items before clearing
            const historyItems = document.querySelectorAll('.history-item');
            historyItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'historyItemSlideOut 0.3s ease-in forwards';
                }, index * 50);
            });

            setTimeout(() => {
                this.history = [];
                this.saveHistory();
                this.loadHistory();
                this.showToast('Історію очищено! 🗑️', 'success');
            }, historyItems.length * 50 + 300);
        }
    }

    switchTab(tabName) {
        // Update tab buttons with animation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active');

        // Update tab content with slide animation
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(`${tabName}-tab`).classList.add('active');
        }, 150);

        // Hide results when switching tabs
        document.getElementById('result').classList.add('hidden');
        
        this.showToast(`Перемкнуто на ${tabName === 'basic' ? 'базовий' : 'розширений'} режим`, 'success');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Animate theme transition
        document.body.style.transition = 'all 0.5s ease';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        this.settings.theme = newTheme;
        this.saveSettings();
        
        this.showToast(`Тему змінено на ${newTheme === 'dark' ? 'темну 🌙' : 'світлу ☀️'}`, 'success');
        
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    setupParticles() {
        const container = document.getElementById('particles-container');
        const particleCount = window.innerWidth < 768 ? 30 : 60;

        // Clear existing particles
        container.innerHTML = '';

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 6 + 2;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 4 + 4;
            const delay = Math.random() * 3;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
        }
    }

    setupAnimations() {
        // Add CSS animations dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes saveSuccess {
                0% { transform: scale(1); }
                50% { transform: scale(1.2) rotate(10deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            @keyframes historyItemSlideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(-100px); }
            }
            
            .input-error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2) !important;
            }
            
            .input-success {
                border-color: #10b981 !important;
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    async showLoadingAnimation() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('hidden');
        
        // Animate loading dots
        const dots = overlay.querySelectorAll('.progress-dot');
        let currentDot = 0;
        
        const animateDots = () => {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentDot].classList.add('active');
            currentDot = (currentDot + 1) % dots.length;
        };
        
        this.loadingInterval = setInterval(animateDots, 500);
        animateDots();
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
        
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = 'ℹ️';
        }
        
        toast.innerHTML = `<div class="toast-message">${icon} ${message}</div>`;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    async showWelcomeSequence() {
        // Wait for page load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Show welcome toast
        this.showToast('Ласкаво просимо до Fuel Calculator Pro! 🚗✨', 'success');
        
        // Animate header elements
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Setup particles after welcome
        setTimeout(() => {
            this.setupParticles();
        }, 1500);
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    const activeTab = document.querySelector('.tab-content.active').id;
                    if (activeTab === 'basic-tab') {
                        this.calculateBasic();
                    } else {
                        this.calculateAdvanced();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    this.saveCurrentResult();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchTab('basic');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchTab('advanced');
                    break;
            }
        }
        
        // ESC to close loading
        if (e.key === 'Escape' && !document.getElementById('loading-overlay').classList.contains('hidden')) {
            this.hideLoading();
            this.isCalculating = false;
        }
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    saveHistory() {
        localStorage.setItem('fuelCalculatorHistory', JSON.stringify(this.history));
    }

    saveSettings() {
        localStorage.setItem('fuelCalculatorSettings', JSON.stringify(this.settings));
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimatedFuelCalculator();
});

// Handle online/offline status
window.addEventListener('online', () => {
    document.querySelector('.calculator-card').style.opacity = '1';
    if (window.calculator) {
        window.calculator.showToast('З\'єднання відновлено! 🌐', 'success');
    }
});

window.addEventListener('offline', () => {
    document.querySelector('.calculator-card').style.opacity = '0.8';
    if (window.calculator) {
        window.calculator.showToast('Відсутнє з\'єднання з інтернетом 📡', 'warning');
    }
});

// Handle window resize for responsive particles
window.addEventListener('resize', () => {
    if (window.calculator) {
        setTimeout(() => {
            window.calculator.setupParticles();
        }, 100);
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`🚀 Fuel Calculator Pro loaded in ${loadTime.toFixed(2)}ms`);
});

// Store calculator instance globally for debugging
window.addEventListener('DOMContentLoaded', () => {
    window.calculator = new AnimatedFuelCalculator();
});