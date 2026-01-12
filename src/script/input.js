document.addEventListener("DOMContentLoaded", () => {
	const inputField = document.getElementById("visaInput");
	const dropZoneVISA = document.getElementById("dropZoneVISA");
	const fileInputVISA = document.createElement("input");

	fileInputVISA.type = "file";
	fileInputVISA.accept = ".txt,.csv";
	fileInputVISA.style.display = "none";
	document.body.appendChild(fileInputVISA);

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
			li.style.cursor = "pointer";
			li.title = "Click to remove";
			li.onclick = () => {
				window.visaArray.splice(idx, 1);
				renderVisaList();
			};
			ul.appendChild(li);
		});
	}

	// -----------------------------
	// Add VISA safely
	// -----------------------------
	function addVisa(value) {
		if (!value) return;
		const visa = value.trim().toUpperCase();

		// Only allow 4 letters OR 4 letters + 1 number
		if (!/^[A-Z]{4}(\d)?$/.test(visa)) return;
		if (window.visaArray.includes(visa)) return;

		window.visaArray.push(visa);
		renderVisaList();
	}

	// -----------------------------
	// Manual input (Enter)
	// -----------------------------
	inputField.addEventListener("keydown", (event) => {
		// Only allow letters or numbers as needed
		if (event.key.length === 1) { // regular char
			const value = inputField.value.toUpperCase();

			if (value.length < 4 && !/[A-Z]/i.test(event.key)) {
				event.preventDefault(); // only letters for first 4 chars
			} else if (value.length === 4 && !/[0-9]/.test(event.key)) {
				event.preventDefault(); // only allow number as 5th char
			} else if (value.length >= 5) {
				event.preventDefault(); // max 5 chars
			}
		}

		// Enter pressed
		if (event.key === "Enter") {
			event.preventDefault();
			const value = inputField.value.toUpperCase();

			// Only allow Enter if 4 letters OR 4 letters + 1 number
			if (/^[A-Z]{4}(\d)?$/.test(value)) {
				addVisa(value);
				inputField.value = "";
			} else {
				// Invalid, maybe flash red briefly
				inputField.style.border = "2px solid red";
				setTimeout(() => inputField.style.border = "", 300);
			}
		}
	});

	// -----------------------------
	// Click DropZone → open file dialog
	// -----------------------------
	dropZoneVISA.addEventListener("click", () => fileInputVISA.click());

	// -----------------------------
	// Drag & Drop
	// -----------------------------
	["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
		dropZoneVISA.addEventListener(eventName, e => {
			e.preventDefault();
			e.stopPropagation();
		});
	});

	dropZoneVISA.addEventListener("dragover", () => dropZoneVISA.classList.add("highlight"));
	dropZoneVISA.addEventListener("dragleave", () => dropZoneVISA.classList.remove("highlight"));

	// Drop file
	dropZoneVISA.addEventListener("drop", (e) => {
		dropZoneVISA.classList.remove("highlight");
		const file = e.dataTransfer.files[0];
		if (!file) return;
		handleVisaFile(file);
	});

	// File input change
	fileInputVISA.addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		handleVisaFile(file);
	});

	// Read VISA file
	function handleVisaFile(file) {
		const reader = new FileReader();

		reader.onload = () => {
			const lines = reader.result.split(/\r?\n/);

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				// VISA is first token
				const visa = trimmed.split(/\s+/)[0].toUpperCase();

				// Only 4 letters OR 4 letters + 1 number
				if (/^[A-Z]{4}(\d)?$/.test(visa)) {
					addVisa(visa);
				}
			}
		};

		reader.readAsText(file);
	}
});