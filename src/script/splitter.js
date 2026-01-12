import { Environnement } from "./Environnement.js";
import { DropZoneHandler } from "./DropZoneHandler.js";

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

	const splitButton = document.getElementById("submit");
	const optionSelect = document.getElementById("pdfOption");
	const env = new Environnement();

	let selectedPDF = null;

	// -----------------------------
	// Initialize DropZones
	// -----------------------------
	const pdfDrop = new DropZoneHandler({
		zoneId: "dropZonePDF",
		fileType: "pdf",
		onFileSelected: (file) => {
			selectedPDF = file;
		}
	});

	const visaDrop = new DropZoneHandler({
		zoneId: "dropZoneVISA",
		fileType: "visa"
	});

	// -----------------------------
	// Submit button
	// -----------------------------
	splitButton.addEventListener("click", async () => {
		if (!selectedPDF) {
			alert("Please select a PDF first!");
			return;
		}
		if (selectedPDF.type !== "application/pdf") {
			alert("Please select a PDF file!");
			return;
		}

		const mode = optionSelect.value;
		console.log("Mode selected:", mode);

		try {
			const arrayBuffer = await selectedPDF.arrayBuffer();
			if (mode === "einzelnePDF") {
				await splitToZip(arrayBuffer);
			} else if (mode === "mergedPDF") {
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

			let code = null;
			let namePart = "";

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
				for (let str of items.slice(0, 40)) {
					if (/^[a-z]{2,5}\d?$/i.test(str.trim())) {
						code = str.trim().toUpperCase();
						break;
					}
				}
				if (!code) code = `PAGE${i}`;
			}

			const joinedText = items.join(" ");
			const visaRegex = new RegExp(`${code}\\s+(.*?)\\s+Pers\\.Nr\\.?`, "i");
			const match = joinedText.match(visaRegex);
			if (match && match[1]) {
				namePart = match[1].trim().replace(/\s+/g, "_");
			}

			let filename = code;
			if (namePart) filename += "_" + namePart;
			filename = filename.replace(/[^A-Za-z0-9\-_]/g, "");

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
				env.noBreakMessage(`ZIP created, but visa(s) ${missing.join(", ")} were not found.`);
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

			let includePage = visaArray.length === 0;

			if (visaArray.length > 0) {
				for (const visa of visaArray) {
					if (items.some(str => str.toUpperCase().includes(visa.toUpperCase()))) {
						foundVisas.add(visa);
						includePage = true;
						break;
					}
				}
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
				alert(`Merged PDF created, but visa(s) ${missing.join(", ")} were not found.`);
			} else {
				env.downloadMessage("✅ Merged PDF created with all requested visas!");
			}
		} else {
			env.downloadMessage("✅ Merged PDF created with all pages!");
		}
	}
});