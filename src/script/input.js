document.addEventListener("DOMContentLoaded", () => {
	// -----------------------------
	// VISA Section
	// -----------------------------
	const inputField = document.getElementById("visaInput");
	const dropZoneVISA = document.getElementById("dropZoneVISA");
	const fileInputVISA = document.getElementById("fileInputVISA");

	if (!window.visaArray) window.visaArray = [];

	function renderVisaList() {
		const ul = document.getElementById("listVisa");
		ul.innerHTML = "";

		window.visaArray.forEach((visa, idx) => {
			const li = document.createElement("li");
			li.textContent = visa;
			li.title = "Click to remove";

			li.addEventListener("click", () => {
				window.visaArray.splice(idx, 1);
				renderVisaList();
			});

			ul.appendChild(li);
		});
	}

	function addVisa(value) {
		if (!value) return;
		const visa = value.trim().toUpperCase();
		if (!/^[A-Z]{4}(\d)?$/.test(visa)) return;
		if (window.visaArray.includes(visa)) return;

		window.visaArray.push(visa);
		renderVisaList();
	}

	inputField.addEventListener("keydown", (event) => {
		if (event.key.length === 1) {
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

	// VISA drag & drop / click
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

	// -----------------------------
	// PDF Section
	// -----------------------------
	const dropZonePDF = document.getElementById("dropZonePDF");
	const fileInputPDF = document.getElementById("fileInput");

	// Make PDF div clickable
	dropZonePDF.addEventListener("click", () => fileInputPDF.click());

	// Drag & drop events
	["dragenter", "dragover", "dragleave", "drop"].forEach(ev =>
		dropZonePDF.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
	);
	dropZonePDF.addEventListener("dragover", () => dropZonePDF.classList.add("highlight"));
	dropZonePDF.addEventListener("dragleave", () => dropZonePDF.classList.remove("highlight"));
	dropZonePDF.addEventListener("drop", (e) => {
		dropZonePDF.classList.remove("highlight");
		handlePdfFiles(e.dataTransfer.files);
	});

	fileInputPDF.addEventListener("change", (e) => handlePdfFiles(e.target.files));

	function handlePdfFiles(files) {
		if (!files || files.length === 0) return;
		const pdfFiles = Array.from(files).filter(f => f.type === "application/pdf");
		if (!pdfFiles.length) return;
		console.log("Selected PDFs:", pdfFiles);
		// Here you can call your splitter function or store the files
	}
});
