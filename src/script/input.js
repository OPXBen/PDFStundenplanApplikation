const input = document.getElementById("visaInput");

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {  // or e.keyCode === 13
        e.preventDefault(); // prevent form submission if inside a form
        myAction();
    }
});

function myAction() {
    alert("You pressed Enter or clicked the button!");
}