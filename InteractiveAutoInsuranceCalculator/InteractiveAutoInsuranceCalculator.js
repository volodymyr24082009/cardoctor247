// Premium Auto Insurance Calculator - Complete Working Version
class PremiumInsuranceCalculator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('insuranceCalculatorHistory')) || [];
        this.settings = JSON.parse(localStorage.getItem('insuranceCalculatorSettings')) || {
            theme: 'light',
            currency: 'грн',
            animations: true
        };
        
        this.currentResult = null;
        this.isCalculating = false;
        this.formProgress = 0;
        this.loadingInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupParticles();
        this.loadHistory();
        this.setupFormValidation();
        this.setupAnimations();
        this.updateFormProgress();
        this.showWelcomeSequence();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                if (tabName) this.switchTab(tabName);
            });
        });

        // Calculate button
        const calculateBtn = document.getElementById('calculate');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateInsurance());
        }

        // Save and share buttons
        const saveBtn = document.getElementById('save-result');
        const shareBtn = document.getElementById('share-result');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCurrentResult());
        if (shareBtn) shareBtn.addEventListener('click', () => this.shareResult());

        // Clear history button
        const clearBtn = document.getElementById('clear-history');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }

        // Form inputs
        this.setupInputListeners();

        // Counter buttons
        this.setupCounterButtons();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Button ripple effects
        this.setupRippleEffects();

        // Intersection Observer for animations
        this.setupScrollAnimations();
    }

    setupInputListeners() {
        const inputs = ['carValue', 'carAge', 'driverAge', 'drivingExperience', 'carType', 'coverageType', 'deductible'];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateInput(element);
                    this.updateFormProgress();
                    this.debounce(() => this.autoCalculate(), 1000)();
                });
                
                element.addEventListener('focus', (e) => this.animateInputFocus(e.target));
            }
        });

        // Special handling for experience slider
        const experienceSlider = document.getElementById('drivingExperience');
        if (experienceSlider) {
            experienceSlider.addEventListener('input', () => {
                this.updateExperienceValue();
                this.updateFormProgress();
                this.debounce(() => this.autoCalculate(), 1000)();
            });
        }
    }

    setupCounterButtons() {
        document.querySelectorAll('.counter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const input = btn.parentElement.querySelector('input');
                if (!input) return;

                const currentValue = parseInt(input.value) || 0;
                const min = parseInt(input.min) || 0;
                const max = parseInt(input.max) || 10;

                if (action === 'increase' && currentValue < max) {
                    input.value = currentValue + 1;
                } else if (action === 'decrease' && currentValue > min) {
                    input.value = currentValue - 1;
                }

                this.updateFormProgress();
                this.debounce(() => this.autoCalculate(), 500)();
            });
        });
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
            if (ripple.parentNode) {
                ripple.remove();
            }
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

    updateFormProgress() {
        const requiredFields = ['carValue', 'carAge', 'driverAge', 'drivingExperience', 'carType'];
        const filledFields = requiredFields.filter(id => {
            const element = document.getElementById(id);
            return element && element.value && element.value.trim() !== '';
        });

        this.formProgress = (filledFields.length / requiredFields.length) * 100;
        
        const progressFill = document.getElementById('form-progress');
        const progressText = document.getElementById('progress-percentage');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${this.formProgress}%`;
            progressText.textContent = `${Math.round(this.formProgress)}%`;
        }
    }

    updateExperienceValue() {
        const slider = document.getElementById('drivingExperience');
        const valueDisplay = document.getElementById('experienceValue');
        
        if (slider && valueDisplay) {
            const value = parseInt(slider.value);
            let text = `${value} років досвіду`;
            
            if (value === 0) {
                text = 'Новачок';
            } else if (value === 1) {
                text = '1 рік досвіду';
            } else if (value >= 20) {
                text = `${value}+ років (досвідчений)`;
            }
            
            valueDisplay.textContent = text;
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
    }

    animateInputFocus(input) {
        const wrapper = input.closest('.input-wrapper') || input.closest('.select-wrapper') || input.closest('.slider-wrapper');
        const icon = wrapper?.parentElement.querySelector('.icon');
        
        if (icon) {
            icon.style.animation = 'iconWiggle 0.5s ease-in-out';
            setTimeout(() => {
                icon.style.animation = '';
            }, 500);
        }
    }

    autoCalculate() {
        if (this.formProgress >= 80 && !this.isCalculating) {
            this.calculateInsurance();
        }
    }

    async calculateInsurance() {
        if (this.isCalculating) return;
        
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        this.isCalculating = true;
        await this.showLoadingAnimation();

        setTimeout(async () => {
            const results = this.performCalculation(formData);
            await this.displayResults(results);
            this.hideLoading();
            this.isCalculating = false;
            this.showToast('Розрахунок страхування завершено! 🎉', 'success');
        }, 1500);
    }

    getFormData() {
        const getValue = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            return element ? (element.type === 'number' ? parseFloat(element.value) || defaultValue : element.value || defaultValue) : defaultValue;
        };

        return {
            carValue: getValue('carValue', 500000),
            carAge: getValue('carAge', 2020),
            driverAge: getValue('driverAge', 30),
            drivingExperience: getValue('drivingExperience', 5),
            carType: getValue('carType', 'sedan'),
            coverageType: getValue('coverageType', 'standard'),
            deductible: getValue('deductible', 0),
            accidentHistory: getValue('accidentHistory', 0)
        };
    }

    validateFormData(data) {
        if (data.carValue <= 0) {
            this.showToast('Будь ласка, введіть коректну вартість автомобіля', 'error');
            this.shakeForm();
            return false;
        }

        if (data.driverAge < 18 || data.driverAge > 80) {
            this.showToast('Вік водія повинен бути від 18 до 80 років', 'error');
            this.shakeForm();
            return false;
        }

        if (data.carValue > 5000000) {
            this.showToast('Вартість автомобіля занадто висока для розрахунку', 'warning');
        }

        return true;
    }

    shakeForm() {
        const form = document.querySelector('.calculator-form');
        if (form) {
            form.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }
    }

    performCalculation(data) {
        // Base rate calculation (5% of car value)
        let baseRate = data.carValue * 0.05;

        // Age factor
        let ageFactor = 1;
        if (data.driverAge < 25) {
            ageFactor = 1.4; // Young drivers
        } else if (data.driverAge > 65) {
            ageFactor = 1.2; // Senior drivers
        } else if (data.driverAge >= 30 && data.driverAge <= 50) {
            ageFactor = 0.9; // Prime age discount
        }

        // Experience factor
        const experienceFactor = Math.max(0.7, 1 - (data.drivingExperience * 0.015));

        // Car type factor
        const carTypeFactors = {
            sedan: 1.0,
            hatchback: 1.05,
            suv: 1.15,
            coupe: 1.25,
            sports: 1.6,
            luxury: 1.4,
            electric: 0.9
        };

        // Coverage type factor
        const coverageFactors = {
            basic: 0.3,
            standard: 1.0,
            premium: 1.8,
            comprehensive: 2.2
        };

        // Car age factor
        const currentYear = new Date().getFullYear();
        const carAgeYears = currentYear - data.carAge;
        const carAgeFactor = Math.max(0.6, 1 - (carAgeYears * 0.05));

        // Accident history factor
        const accidentFactor = 1 + (data.accidentHistory * 0.25);

        // Deductible discount
        const deductibleDiscount = data.deductible > 0 ? Math.max(0.7, 1 - (data.deductible / data.carValue * 0.5)) : 1;

        // Calculate final premium
        const annualPremium = baseRate * 
            ageFactor * 
            experienceFactor * 
            (carTypeFactors[data.carType] || 1.0) * 
            (coverageFactors[data.coverageType] || 1.0) * 
            carAgeFactor * 
            accidentFactor * 
            deductibleDiscount;

        // Risk assessment
        const riskScore = this.calculateRiskScore(data);
        
        return {
            ...data,
            annualPremium: Math.round(Math.max(1000, annualPremium)), // Minimum 1000 грн
            monthlyPayment: Math.round(Math.max(84, annualPremium / 12)), // Minimum 84 грн/month
            riskScore,
            factors: {
                age: ageFactor,
                experience: experienceFactor,
                carType: carTypeFactors[data.carType] || 1.0,
                coverage: coverageFactors[data.coverageType] || 1.0,
                carAge: carAgeFactor,
                accidents: accidentFactor,
                deductible: deductibleDiscount
            },
            timestamp: new Date()
        };
    }

    calculateRiskScore(data) {
        let riskScore = 50; // Base risk

        // Age risk
        if (data.driverAge < 25) riskScore += 20;
        else if (data.driverAge > 65) riskScore += 15;
        else if (data.driverAge >= 30 && data.driverAge <= 50) riskScore -= 10;

        // Experience risk
        if (data.drivingExperience < 2) riskScore += 25;
        else if (data.drivingExperience > 10) riskScore -= 15;

        // Car type risk
        const carTypeRisks = {
            sedan: 0,
            hatchback: 5,
            suv: 10,
            coupe: 15,
            sports: 30,
            luxury: 20,
            electric: -10
        };
        riskScore += carTypeRisks[data.carType] || 0;

        // Accident history
        riskScore += data.accidentHistory * 15;

        // Car age
        const currentYear = new Date().getFullYear();
        const carAgeYears = currentYear - data.carAge;
        if (carAgeYears > 10) riskScore += 10;
        else if (carAgeYears < 3) riskScore -= 5;

        return Math.max(0, Math.min(100, riskScore));
    }

    async displayResults(results) {
        const resultCard = document.getElementById('result');
        if (!resultCard) return;
        
        // Animate result values with counting effect
        await this.animateValue('insuranceResult', 0, results.annualPremium, 1500, (value) => Math.round(value));
        await this.animateValue('monthlyPayment', 0, results.monthlyPayment, 1200, (value) => Math.round(value));

        // Update coverage level
        const coverageTexts = {
            basic: 'Базове',
            standard: 'Стандартне',
            premium: 'Преміум',
            comprehensive: 'Комплексне'
        };
        
        const coverageElement = document.querySelector('#coverageLevel .coverage-text');
        if (coverageElement) {
            coverageElement.textContent = coverageTexts[results.coverageType] || 'Стандартне';
        }

        // Update risk level
        const riskLevel = this.getRiskLevel(results.riskScore);
        const riskElement = document.querySelector('#riskLevel .risk-text');
        if (riskElement) {
            riskElement.textContent = riskLevel.text;
            riskElement.style.color = riskLevel.color;
        }

        // Update risk analysis
        this.updateRiskAnalysis(results);

        // Update recommendations
        this.updateRecommendations(results);

        // Store current result
        this.currentResult = results;

        // Show result card
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
                
                element.textContent = formatter(currentValue).toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    getRiskLevel(riskScore) {
        if (riskScore <= 30) {
            return { text: 'Низький', color: '#10b981' };
        } else if (riskScore <= 50) {
            return { text: 'Помірний', color: '#f59e0b' };
        } else if (riskScore <= 70) {
            return { text: 'Підвищений', color: '#ef4444' };
        } else {
            return { text: 'Високий', color: '#dc2626' };
        }
    }

    updateRiskAnalysis(results) {
        // Age risk
        const ageRisk = this.calculateAgeRisk(results.driverAge);
        this.updateRiskFactor('age-risk', ageRisk);

        // Experience risk
        const experienceRisk = this.calculateExperienceRisk(results.drivingExperience);
        this.updateRiskFactor('experience-risk', experienceRisk);

        // Car type risk
        const carRisk = this.calculateCarRisk(results.carType);
        this.updateRiskFactor('car-risk', carRisk);
    }

    calculateAgeRisk(age) {
        if (age < 25) return { level: 70, text: 'Високий', color: '#ef4444' };
        if (age > 65) return { level: 60, text: 'Підвищений', color: '#f59e0b' };
        if (age >= 30 && age <= 50) return { level: 20, text: 'Низький', color: '#10b981' };
        return { level: 40, text: 'Помірний', color: '#f59e0b' };
    }

    calculateExperienceRisk(experience) {
        if (experience < 2) return { level: 80, text: 'Високий', color: '#ef4444' };
        if (experience < 5) return { level: 50, text: 'Помірний', color: '#f59e0b' };
        if (experience > 15) return { level: 15, text: 'Низький', color: '#10b981' };
        return { level: 30, text: 'Низький', color: '#10b981' };
    }

    calculateCarRisk(carType) {
        const risks = {
            sedan: { level: 30, text: 'Низький', color: '#10b981' },
            hatchback: { level: 35, text: 'Низький', color: '#10b981' },
            suv: { level: 45, text: 'Помірний', color: '#f59e0b' },
            coupe: { level: 55, text: 'Підвищений', color: '#ef4444' },
            sports: { level: 80, text: 'Високий', color: '#dc2626' },
            luxury: { level: 60, text: 'Підвищений', color: '#ef4444' },
            electric: { level: 25, text: 'Низький', color: '#10b981' }
        };
        return risks[carType] || { level: 40, text: 'Помірний', color: '#f59e0b' };
    }

    updateRiskFactor(factorId, risk) {
        const fillElement = document.getElementById(factorId);
        const textElement = document.getElementById(`${factorId}-text`);
        
        if (fillElement && textElement) {
            fillElement.style.width = `${risk.level}%`;
            fillElement.style.background = risk.color;
            textElement.textContent = risk.text;
            textElement.style.color = risk.color;
        }
    }

    updateRecommendations(results) {
        const recommendationsList = document.getElementById('recommendations-list');
        if (!recommendationsList) return;

        const recommendations = this.generateRecommendations(results);
        
        recommendationsList.innerHTML = recommendations.map((rec, index) => `
            <div class="recommendation-item" style="animation-delay: ${index * 0.1}s">
                <span class="recommendation-icon">${rec.icon}</span>
                <span class="recommendation-text">${rec.text}</span>
            </div>
        `).join('');
    }

    generateRecommendations(results) {
        const recommendations = [];

        // Age-based recommendations
        if (results.driverAge < 25) {
            recommendations.push({
                icon: '🎓',
                text: 'Пройдіть курси безпечного водіння для отримання знижки'
            });
        }

        // Experience-based recommendations
        if (results.drivingExperience < 5) {
            recommendations.push({
                icon: '🚗',
                text: 'Накопичуйте досвід безаварійного водіння для зниження тарифів'
            });
        }

        // Car type recommendations
        if (results.carType === 'sports' || results.carType === 'luxury') {
            recommendations.push({
                icon: '🔒',
                text: 'Встановіть додаткові системи безпеки та сигналізацію'
            });
        }

        // Accident history recommendations
        if (results.accidentHistory > 0) {
            recommendations.push({
                icon: '⚠️',
                text: 'Дотримуйтесь правил дорожнього руху для покращення історії'
            });
        }

        // Deductible recommendations
        if (results.deductible === 0) {
            recommendations.push({
                icon: '💰',
                text: 'Розгляньте можливість встановлення франшизи для зниження вартості'
            });
        }

        // Coverage recommendations
        if (results.coverageType === 'basic') {
            recommendations.push({
                icon: '🛡️',
                text: 'Розширте покриття для кращого захисту вашого автомобіля'
            });
        }

        // Car age recommendations
        const currentYear = new Date().getFullYear();
        const carAge = currentYear - results.carAge;
        if (carAge > 10) {
            recommendations.push({
                icon: '🔧',
                text: 'Регулярно проходьте технічне обслуговування старого автомобіля'
            });
        }

        // Default recommendations if none specific
        if (recommendations.length === 0) {
            recommendations.push(
                {
                    icon: '🏆',
                    text: 'Підтримуйте чисту історію водіння для найкращих тарифів'
                },
                {
                    icon: '📱',
                    text: 'Використовуйте мобільні додатки для моніторингу водіння'
                }
            );
        }

        return recommendations.slice(0, 5); // Максимум 5 рекомендацій
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
        if (saveBtn) {
            saveBtn.style.animation = 'saveSuccess 0.6s ease-out';
            setTimeout(() => {
                saveBtn.style.animation = '';
            }, 600);
        }
    }

    shareResult() {
        if (!this.currentResult) {
            this.showToast('Немає результату для поділення', 'warning');
            return;
        }

        const shareText = `🚗 Розрахунок автострахування:
💰 Річна вартість: ${this.currentResult.annualPremium.toLocaleString()} грн
📅 Місячний платіж: ${this.currentResult.monthlyPayment.toLocaleString()} грн
🛡️ Покриття: ${this.getCoverageTypeText(this.currentResult.coverageType)}
📊 Рівень ризику: ${this.getRiskLevel(this.currentResult.riskScore).text}

Розраховано на Premium Insurance Calculator`;

        if (navigator.share) {
            navigator.share({
                title: 'Розрахунок автострахування',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showToast('Результат успішно поділено! 📤', 'success');
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Результат скопійовано в буфер обміну! 📋', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Результат скопійовано в буфер обміну! 📋', 'success');
        } catch (err) {
            this.showToast('Не вдалося скопіювати результат', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    loadHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <div class="empty-animation">
                        <span class="empty-icon">📋</span>
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
                    <strong>${result.annualPremium.toLocaleString()} ${this.settings.currency}/рік</strong>
                    <span class="history-date">${this.formatDate(result.timestamp)}</span>
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <span class="history-detail-label">Вартість авто:</span>
                        <span class="history-detail-value">${result.carValue.toLocaleString()} грн</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Вік водія:</span>
                        <span class="history-detail-value">${result.driverAge} років</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Досвід:</span>
                        <span class="history-detail-value">${result.drivingExperience} років</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Тип авто:</span>
                        <span class="history-detail-value">${this.getCarTypeText(result.carType)}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Покриття:</span>
                        <span class="history-detail-value">${this.getCoverageTypeText(result.coverageType)}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Ризик:</span>
                        <span class="history-detail-value">${this.getRiskLevel(result.riskScore).text}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCarTypeText(carType) {
        const types = {
            sedan: 'Седан',
            hatchback: 'Хетчбек',
            suv: 'Позашляховик',
            coupe: 'Купе',
            sports: 'Спортивний',
            luxury: 'Преміум',
            electric: 'Електромобіль'
        };
        return types[carType] || carType;
    }

    getCoverageTypeText(coverageType) {
        const types = {
            basic: 'Базове',
            standard: 'Стандартне',
            premium: 'Преміум',
            comprehensive: 'Комплексне'
        };
        return types[coverageType] || coverageType;
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
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update tab content with slide animation
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        setTimeout(() => {
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        }, 150);

        // Hide results when switching tabs
        const resultCard = document.getElementById('result');
        if (resultCard) {
            resultCard.classList.add('hidden');
        }
        
        const tabNames = {
            basic: 'базовий',
            advanced: 'розширений',
            comparison: 'порівняння'
        };
        
        this.showToast(`Перемкнуто на ${tabNames[tabName] || tabName} режим`, 'success');
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
        if (!container) return;

        const particleCount = window.innerWidth < 768 ? 40 : 80;

        // Clear existing particles
        container.innerHTML = '';

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 8 + 3;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 6 + 6;
            const delay = Math.random() * 4;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
        }
    }

    setupFormValidation() {
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

    setupAnimations() {
        // Initialize experience slider value
        this.updateExperienceValue();
    }

    async showLoadingAnimation() {
        const overlay = document.getElementById('loading-overlay');
        if (!overlay) return;

        overlay.classList.remove('hidden');
        
        // Animate loading dots
        const dots = overlay.querySelectorAll('.progress-dot');
        let currentDot = 0;
        
        const animateDots = () => {
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentDot]) {
                dots[currentDot].classList.add('active');
            }
            currentDot = (currentDot + 1) % dots.length;
        };
        
        this.loadingInterval = setInterval(animateDots, 500);
        animateDots();
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

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
        this.showToast('Ласкаво просимо до Premium Insurance Calculator! 🚗✨', 'success');
        
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
                    this.calculateInsurance();
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
                case '3':
                    e.preventDefault();
                    this.switchTab('comparison');
                    break;
            }
        }
        
        // ESC to close loading
        if (e.key === 'Escape') {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                this.hideLoading();
                this.isCalculating = false;
            }
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
        try {
            localStorage.setItem('insuranceCalculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Could not save history to localStorage:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('insuranceCalculatorSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage:', e);
        }
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Store calculator instance globally for debugging
    window.calculator = new PremiumInsuranceCalculator();
});

// Handle online/offline status
window.addEventListener('online', () => {
    const calculatorCard = document.querySelector('.calculator-card');
    if (calculatorCard) {
        calculatorCard.style.opacity = '1';
    }
    if (window.calculator) {
        window.calculator.showToast('З\'єднання відновлено! 🌐', 'success');
    }
});

window.addEventListener('offline', () => {
    const calculatorCard = document.querySelector('.calculator-card');
    if (calculatorCard) {
        calculatorCard.style.opacity = '0.8';
    }
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
    console.log(`🚀 Premium Insurance Calculator loaded in ${loadTime.toFixed(2)}ms`);
});

// Prevent multiple initializations
let calculatorInitialized = false;

// Safe initialization
if (!calculatorInitialized) {
    calculatorInitialized = true;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.calculator) {
                window.calculator = new PremiumInsuranceCalculator();
            }
        });
    } else {
        // DOM already loaded
        if (!window.calculator) {
            window.calculator = new PremiumInsuranceCalculator();
        }
    }
}