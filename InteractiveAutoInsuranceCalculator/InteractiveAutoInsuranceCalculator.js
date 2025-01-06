document.addEventListener('DOMContentLoaded', function() {
    const carValue = document.getElementById('carValue');
    const driverAge = document.getElementById('driverAge');
    const drivingExperience = document.getElementById('drivingExperience');
    const experienceValue = document.getElementById('experienceValue');
    const carType = document.getElementById('carType');
    const accidentHistory = document.getElementById('accidentHistory');
    const insuranceResult = document.getElementById('insuranceResult');

    const inputs = [carValue, driverAge, drivingExperience, carType, accidentHistory];

    inputs.forEach(input => {
        input.addEventListener('input', calculateInsurance);
    });

    drivingExperience.addEventListener('input', function() {
        experienceValue.textContent = this.value + ' років';
    });

    function calculateInsurance() {
        let baseRate = Number(carValue.value) * 0.05;
        
        if (Number(driverAge.value) < 25) baseRate *= 1.3;
        else if (Number(driverAge.value) > 65) baseRate *= 1.2;
        
        baseRate *= (1 - (Number(drivingExperience.value) * 0.01));
        
        if (carType.value === 'sports') baseRate *= 1.5;
        else if (carType.value === 'suv') baseRate *= 1.3;
        
        baseRate *= (1 + (Number(accidentHistory.value) * 0.2));
        
        animateValue(insuranceResult, Number(insuranceResult.textContent.replace(' грн', '')), baseRate, 500);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.textContent = Math.floor(progress * (end - start) + start).toFixed(2) + ' грн';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    calculateInsurance();
});

