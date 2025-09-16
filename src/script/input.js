document.addEventListener("DOMContentLoaded", () => {
    let enterPressed = false;
    let enterNumb = 0;

    const inputField = document.getElementById("visaInput");

    inputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            enterPressed = true;

            const valueInput = document.getElementById("visaInput");
            const value = valueInput.value.trim().toUpperCase();

            // Initialize visaArray outside the event handler to persist values
            if (!window.visaArray) window.visaArray = [];

            function renderVisaList() {
                const ul = document.getElementById('listVisa');
                ul.innerHTML = '';
                window.visaArray.forEach((visa, idx) => {
                    const li = document.createElement('li');
                    li.textContent = visa;
                    li.style.cursor = 'pointer';
                    li.title = 'Click to remove';
                    li.onclick = () => {
                        window.visaArray.splice(idx, 1);
                        renderVisaList();
                    };
                    ul.appendChild(li);
                });
            }

            // Check for duplicate and show error if needed
            const errorDiv = document.getElementById('visaError');
            if (value && value.length === 4) {
            if (window.visaArray.includes(value)) {
                if (errorDiv) {
                errorDiv.textContent = "Error: This value is already in the list.";
                }
            } else {
                window.visaArray.push(value);
                renderVisaList();
                if (errorDiv) errorDiv.textContent = "";
            }
            valueInput.value = '';
            }
        }
    });
});


 
