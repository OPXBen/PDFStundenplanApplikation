document.addEventListener("DOMContentLoaded", () => {
    let enterPressed = false;

    const inputField = document.getElementById("visaInput");

    inputField.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            enterPressed = true;
        }

        console.log("Key pressed:", event.key);
        console.log("was enter pressed?", enterPressed);
    });
});

    valueInput = document.getElementById("visaInput");
    console.log("Input field:", valueInput);
 
