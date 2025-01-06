document.addEventListener('DOMContentLoaded', function() {
    const distanceInput = document.getElementById('distance');
    const priceInput = document.getElementById('price');
    const consumptionInput = document.getElementById('consumption');
    const calculateButton = document.getElementById('calculate');
    const resultDiv = document.getElementById('result');
    const costSpan = document.getElementById('cost');

    calculateButton.addEventListener('click', calculateFuelCost);

    function calculateFuelCost() {
        const distance = parseFloat(distanceInput.value);
        const price = parseFloat(priceInput.value);
        const consumption = parseFloat(consumptionInput.value);

        if (isNaN(distance) || isNaN(price) || isNaN(consumption)) {
            alert('Будь ласка, введіть коректні числові значення у всі поля.');
            return;
        }

        const cost = (distance / 100) * consumption * price;
        const roundedCost = cost.toFixed(2);

        costSpan.textContent = roundedCost;
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');

        // Видалення класу анімації після її завершення
        setTimeout(() => {
            resultDiv.classList.remove('fade-in');
        }, 500);
    }
});

