window.addEventListener("DOMContentLoaded", () => {
    let sheets = document.getElementsByTagName("link");

    if (sheets.length === 0) {
        // Create a <link> if none exists
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../css/light-mode.css"; // default theme
        document.head.appendChild(link);
    } else {
        // If one exists, set it to default
        sheets[0].href = "../css/light-mode.css";
    }
});

function toggleTheme(value) {
    let sheets = document.getElementsByTagName("link");
    sheets[0].href = "../css/" + value;
}