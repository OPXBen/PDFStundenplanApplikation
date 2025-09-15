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

    // Set default icon visibility
    document.getElementById("sun").style.display = "none";
    document.getElementById("moon").style.display = "inline";
});

function toggleTheme(value) {
    let sheets = document.getElementsByTagName("link");
    sheets[0].href = "../css/" + value;

    // Toggle the icons
    let sun = document.getElementById("sun");
    let moon = document.getElementById("moon");

    if (sun.style.display === "none") {
        // Currently in dark mode → switch to light
        sun.style.display = "inline";
        moon.style.display = "none";
    } else {
        // Currently in light mode → switch to dark
        sun.style.display = "none";
        moon.style.display = "inline";
    }
}