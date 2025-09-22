document.addEventListener("DOMContentLoaded", () => {
	const { PDFDocument } = window.PDFLib || {};
	if (!PDFDocument) {
		console.error("PDF-lib not loaded! Check the script tag in index.html.");
		return;
	}

	if (typeof pdfjsLib === "undefined") {
		console.error("pdfjsLib not loaded! Check the script tag in index.html.");
		return;
	}

	const dropZone = document.getElementById("dropZone");
	const fileInput = document.getElementById("fileInput");
	const splitButton = document.getElementById("submit");
	const optionSelect = document.getElementById("pdfOption");

	let selectedFile = null;

	// -----------------------------
	// File selection via input
	// -----------------------------
	fileInput.addEventListener("change", (e) => {
		if (!e.target.files.length) return;
		selectedFile = e.target.files[0];
		console.log("Selected via input:", selectedFile.name);
		dropZone.textContent = `Selected: ${selectedFile.name}`;
	});

	// -----------------------------
	// Click dropZone to open file dialog
	// -----------------------------
	dropZone.addEventListener("click", () => fileInput.click());

	// -----------------------------
	// Prevent default drag behaviors
	// -----------------------------
	["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
		document.addEventListener(eventName, e => {
			e.preventDefault();
			e.stopPropagation();
		}, false);
	});

	dropZone.addEventListener("dragover", (e) => {
		e.dataTransfer.dropEffect = "copy";
		dropZone.classList.add("highlight");
	});

	dropZone.addEventListener("dragleave", () => dropZone.classList.remove("highlight"));

	dropZone.addEventListener("drop", (e) => {
		dropZone.classList.remove("highlight");
		const files = e.dataTransfer.files;
		if (!files || !files.length) return;
		selectedFile = files[0];
		console.log("Dropped file:", selectedFile.name);
		dropZone.textContent = `Selected: ${selectedFile.name}`;
	});

	// -----------------------------
	// Submit button
	// -----------------------------
	splitButton.addEventListener("click", async () => {
		console.log("Submit clicked. Current file:", selectedFile);

		if (!selectedFile) {
			alert("Please select a PDF first!");
			return;
		}
		if (selectedFile.type !== "application/pdf") {
			alert("Please select a PDF file!");
			return;
		}

		const mode = optionSelect.value;
		console.log("Mode selected:", mode);

		try {
			const arrayBuffer = await selectedFile.arrayBuffer();
			if (mode === "einzelnePDF") {
				console.log("Running splitToZip...");
				await splitToZip(arrayBuffer);
			} else if (mode === "mergedPDF") {
				console.log("Running mergeToSingle...");
				await mergeToSingle(arrayBuffer);
			}
		} catch (err) {
			console.error("Error processing PDF:", err);
			alert("Failed. See console for details.");
		}
	});

	// -----------------------------
	// Split into individual PDFs → ZIP
	// -----------------------------
	async function splitToZip(arrayBuffer) {
		const rawPdf = new Uint8Array(arrayBuffer);
		const pdfDoc = await PDFDocument.load(rawPdf);
		const pdfTextDoc = await pdfjsLib.getDocument({ data: rawPdf }).promise;
		const numPages = pdfTextDoc.numPages;

		const zip = new JSZip();

		for (let i = 1; i <= numPages; i++) {
			const page = await pdfTextDoc.getPage(i);
			const textContent = await page.getTextContent();
			const items = textContent.items.map(it => it.str);

			// Debug: show the first 40 items
			console.log(`--- Page ${i} first 40 items ---`, items.slice(0, 40));

			let code = null;

			// Find the first item that looks like a teacher short code
			for (let str of items.slice(0, 40)) {
				if (/^[a-z]{2,5}\d?$/.test(str.trim())) {
					code = str.trim().toLowerCase();
					break;
				}
			}

			// Fallback
			if (!code) {
				code = `teacher${i}`;
			}

			// Sanitize filename
			code = code.replace(/[^a-z0-9\-]/g, "");

			// Ensure unique filename in ZIP
			let filename = `${code}.pdf`;
			let suffix = 1;
			while (zip.file(filename)) {
				filename = `${code}_${suffix++}.pdf`;
			}

			// Copy page into new PDF
			const newDoc = await PDFDocument.create();
			const [copiedPage] = await newDoc.copyPages(pdfDoc, [i - 1]);
			newDoc.addPage(copiedPage);

			const pdfBytes = await newDoc.save();
			zip.file(filename, pdfBytes);

			console.log(`page ${i} -> ${filename}`);
		}

		const zipBlob = await zip.generateAsync({ type: "blob" });
		saveAs(zipBlob, "split_pdfs.zip");

		console.log("ZIP created successfully!");
		alert("All PDFs saved into a ZIP!");
	}

	// -----------------------------
	// Merge into single PDF
	// -----------------------------
	async function mergeToSingle(arrayBuffer) {
		const rawPdf = new Uint8Array(arrayBuffer);
		const pdfDoc = await PDFDocument.load(rawPdf);
		const pdfTextDoc = await pdfjsLib.getDocument({ data: rawPdf }).promise;
		const numPages = pdfTextDoc.numPages;

		const mergedDoc = await PDFDocument.create();

		for (let i = 0; i < numPages; i++) {
			const [copiedPage] = await mergedDoc.copyPages(pdfDoc, [i]);
			mergedDoc.addPage(copiedPage);
		}

		const mergedBytes = await mergedDoc.save();
		const blob = new Blob([mergedBytes], { type: "application/pdf" });
		saveAs(blob, "merged.pdf");

		console.log("Merged PDF created!");
		alert("Merged PDF saved!");
	}
});