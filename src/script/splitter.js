import { Environnement } from "./Environnement.js";

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

	const dropZonePDF = document.getElementById("dropZonePDF");
	const fileInput = document.getElementById("fileInput");
	const splitButton = document.getElementById("submit");
	const optionSelect = document.getElementById("pdfOption");
	const env = new Environnement();

	let selectedFile = null;

	// -----------------------------
	// File selection via input
	// -----------------------------
	fileInput.addEventListener("change", (e) => {
		if (!e.target.files.length) return;
		selectedFile = e.target.files[0];
		console.log("Selected via input:", selectedFile.name);
		dropZonePDF.textContent = `Selected: ${selectedFile.name}`;
	});

	// -----------------------------
	// Click dropZonePDF to open file dialog
	// -----------------------------
	dropZonePDF.addEventListener("click", () => fileInput.click());

	// -----------------------------
	// Prevent default drag behaviors
	// -----------------------------
	["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
		document.addEventListener(eventName, e => {
			e.preventDefault();
			e.stopPropagation();
		}, false);
	});

	dropZonePDF.addEventListener("dragover", (e) => {
		e.dataTransfer.dropEffect = "copy";
		dropZonePDF.classList.add("highlight");
	});

	dropZonePDF.addEventListener("dragleave", () => dropZonePDF.classList.remove("highlight"));

	dropZonePDF.addEventListener("drop", (e) => {
		dropZonePDF.classList.remove("highlight");
		const files = e.dataTransfer.files;
		if (!files || !files.length) return;
		selectedFile = files[0];
		console.log("Dropped file:", selectedFile.name);
		dropZonePDF.textContent = `Selected: ${selectedFile.name}`;
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
			alert("Error processing PDF:", err);
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
		const foundVisas = new Set();
		const visaArray = window.visaArray || [];

		for (let i = 1; i <= numPages; i++) {
			const page = await pdfTextDoc.getPage(i);
			const textContent = await page.getTextContent();
			const items = textContent.items.map(it => it.str);

			let code = null; // visa
			let namePart = ""; // name

			if (visaArray.length > 0) {
				for (const visa of visaArray) {
					if (items.some(str => str.toUpperCase().includes(visa.toUpperCase()))) {
						code = visa;
						foundVisas.add(visa);
						break;
					}
				}
				if (!code) continue;
			} else {
				// Auto-detect visa
				for (let str of items.slice(0, 40)) {
					if (/^[a-z]{2,5}\d?$/i.test(str.trim())) {
						code = str.trim().toUpperCase();
						break;
					}
				}
				if (!code) code = `PAGE${i}`;
			}

			// Extract name: everything after visa up to "Pers.Nr."
			const joinedText = items.join(" ");
			const visaRegex = new RegExp(`${code}\\s+(.*?)\\s+Pers\\.Nr\\.?`, "i");
			const match = joinedText.match(visaRegex);
			if (match && match[1]) {
				namePart = match[1].trim().replace(/\s+/g, "_");
			}

			// Build filename: VISA_fullname
			let filename = code;
			if (namePart) filename += "_" + namePart;

			// Sanitize filename
			filename = filename.replace(/[^A-Za-z0-9\-_]/g, "");

			// Ensure unique filename
			let suffix = 1;
			let finalName = filename + ".pdf";
			while (zip.file(finalName)) {
				finalName = `${filename}_${suffix++}.pdf`;
			}

			const newDoc = await PDFDocument.create();
			const [copiedPage] = await newDoc.copyPages(pdfDoc, [i - 1]);
			newDoc.addPage(copiedPage);

			const pdfBytes = await newDoc.save();
			zip.file(finalName, pdfBytes);
			console.log(`page ${i} -> ${finalName}`);
		}

		if (Object.keys(zip.files).length === 0) {
			alert("All visas entered are not in the provided PDF. Please check the PDF or the visa codes.");
			return;
		}

		const zipBlob = await zip.generateAsync({ type: "blob" });
		saveAs(zipBlob, "split_pdfs.zip");

		if (visaArray.length > 0) {
			const missing = visaArray.filter(v => !foundVisas.has(v));
			if (missing.length) {
				env.noBreakMessage(`ZIP created, but visa(s) ${missing.join(", ")} were not found in the document.`);
			} else {
				env.downloadMessage("✅ All requested visas saved into a ZIP!");
			}
		} else {
			env.downloadMessage("✅ All pages saved into a ZIP!");
		}
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
		const foundVisas = new Set();
		const visaArray = window.visaArray || [];
		let addedPages = 0;

		for (let i = 1; i <= numPages; i++) {
			const page = await pdfTextDoc.getPage(i);
			const textContent = await page.getTextContent();
			const items = textContent.items.map(it => it.str);

			let includePage = false;

			if (visaArray.length > 0) {
				for (const visa of visaArray) {
					if (items.some(str => str.toUpperCase().includes(visa.toUpperCase()))) {
						foundVisas.add(visa);
						includePage = true;
						break;
					}
				}
			} else {
				includePage = true;
			}

			if (includePage) {
				const [copiedPage] = await mergedDoc.copyPages(pdfDoc, [i - 1]);
				mergedDoc.addPage(copiedPage);
				addedPages++;
			}
		}

		if (addedPages === 0) {
			alert("All visas entered are not in the provided PDF. Please check the PDF or the visa codes.");
			return;
		}

		const mergedBytes = await mergedDoc.save();
		const blob = new Blob([mergedBytes], { type: "application/pdf" });
		saveAs(blob, "merged.pdf");

		if (visaArray.length > 0) {
			const missing = visaArray.filter(v => !foundVisas.has(v));
			if (missing.length) {
				alert(`Merged PDF created, but visa(s) ${missing.join(", ")} were not found in the document.`);
			} else {
				env.downloadMessage("✅ Merged PDF created with all requested visas!");
			}
		} else {
			env.downloadMessage("✅ Merged PDF created with all pages!");
		}
	}

});