document.addEventListener("DOMContentLoaded", () => {
	const inputField = document.getElementById("visaInput");
	const dropZoneVISA = document.getElementById("dropZoneVISA");
	const fileInputVISA = document.getElementById("fileInputVISA");

	if (!window.visaArray) window.visaArray = [];

	// -----------------------------
	// Render VISA list
	// -----------------------------
	function renderVisaList() {
		const ul = document.getElementById("listVisa");
		ul.innerHTML = "";

		window.visaArray.forEach((visa, idx) => {
			const li = document.createElement("li");
			li.textContent = visa;
			li.title = "Click to remove";

			// Remove item on click
			li.addEventListener("click", () => {
				window.visaArray.splice(idx, 1); // remove from array
				renderVisaList();                 // re-render list
			});

			ul.appendChild(li);
		});
	}

	// -----------------------------
	// Add VISA safely
	// -----------------------------
	function addVisa(value) {
		if (!value) return;
		const visa = value.trim().toUpperCase();

		if (!/^[A-Z]{4}(\d)?$/.test(visa)) return;
		if (window.visaArray.includes(visa)) return;

		window.visaArray.push(visa);
		renderVisaList();
	}

	// -----------------------------
	// Manual input (Enter)
	// -----------------------------
	inputField.addEventListener("keydown", (event) => {
		if (event.key.length === 1) { // regular char
			const value = inputField.value.toUpperCase();

			if (value.length < 4 && !/[A-Z]/i.test(event.key)) event.preventDefault();
			else if (value.length === 4 && !/[0-9]/.test(event.key)) event.preventDefault();
			else if (value.length >= 5) event.preventDefault();
		}

		if (event.key === "Enter") {
			event.preventDefault();
			const value = inputField.value.toUpperCase();
			if (/^[A-Z]{4}(\d)?$/.test(value)) {
				addVisa(value);
				inputField.value = "";
			} else {
				inputField.style.border = "2px solid red";
				setTimeout(() => inputField.style.border = "", 300);
			}
		}
	});

	// -----------------------------
	// VISA File Input / Drop
	// -----------------------------
	dropZoneVISA.addEventListener("click", () => fileInputVISA.click());

	["dragenter", "dragover", "dragleave", "drop"].forEach(ev =>
		dropZoneVISA.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
	);
	dropZoneVISA.addEventListener("dragover", () => dropZoneVISA.classList.add("highlight"));
	dropZoneVISA.addEventListener("dragleave", () => dropZoneVISA.classList.remove("highlight"));

	dropZoneVISA.addEventListener("drop", (e) => {
		dropZoneVISA.classList.remove("highlight");
		handleVisaFile(e.dataTransfer.files[0]);
	});

	fileInputVISA.addEventListener("change", (e) => handleVisaFile(e.target.files[0]));

	function handleVisaFile(file) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const lines = reader.result.split(/\r?\n/);
			for (const line of lines) {
				const visa = line.trim().split(/\s+/)[0].toUpperCase();
				if (/^[A-Z]{4}(\d)?$/.test(visa)) addVisa(visa);
			}
		};
		reader.readAsText(file);
	}
});