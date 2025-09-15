const input = document.getElementById("visaInput");

input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {  // or e.keyCode === 13
        myAction();
    }
});

function myAction() {
    alert("You pressed Enter or clicked the button!");
}