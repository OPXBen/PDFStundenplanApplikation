window.addEventListener("DOMContentLoaded", () => {
	let themeLink = document.querySelector('link[href*="mode.css"]');

	if (!themeLink) {
		themeLink = document.createElement("link");
		themeLink.rel = "stylesheet";
		themeLink.href = "../css/light-mode.css";
		document.head.appendChild(themeLink);
	}

	const sun = document.getElementById("sun");
	const moon = document.getElementById("moon");

	// default: light mode
	sun.style.display = "none";
	moon.style.display = "grid";

	document.getElementById("themeToggleBtn")
		.addEventListener("click", toggleTheme);
});

function toggleTheme() {
	const themeLink = document.querySelector('link[href*="mode.css"]');
	const sun = document.getElementById("sun");
	const moon = document.getElementById("moon");

	const isDark = themeLink.href.includes("dark-mode.css");

	if (isDark) {
		// switch to light
		themeLink.href = "../css/light-mode.css";
		sun.style.display = "none";
		moon.style.display = "grid";
	} else {
		// switch to dark
		themeLink.href = "../css/dark-mode.css";
		sun.style.display = "grid";
		moon.style.display = "none";
	}
}