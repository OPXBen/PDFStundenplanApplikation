import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib";
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs";

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

// prevent browser from opening the file
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  document.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

// highlight when dragging over
dropzone.addEventListener("dragover", () => dropzone.classList.add("highlight"));
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("highlight"));
dropzone.addEventListener("drop", () => dropzone.classList.remove("highlight"));

// handle dropped file (works IE10+ and modern browsers)
dropzone.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (!files || !files.length) return;
  handleFile(files[0]);
});

// handle manual file input
fileInput.addEventListener("change", (e) => {
  if (!e.target.files.length) return;
  handleFile(e.target.files[0]);
});

async function handleFile(file) {
  if (file.type !== "application/pdf") {
    alert("Please drop a PDF file!");
    return;
  }

  const arrayBuffer = await file.arrayBuffer();
  await splitPdf(arrayBuffer);
}

async function splitPdf(arrayBuffer) {
  const rawPdf = new Uint8Array(arrayBuffer);

  const pdfText = await pdfjsLib.getDocument({ data: rawPdf }).promise;
  const fullDoc = await PDFDocument.load(rawPdf);

  for (let i = 1; i <= pdfText.numPages; i++) {
    const page = await pdfText.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(it => it.str).join(" ");

    // Extract teacher name before "Pers.Nr."
    let match = text.match(/^(.*?)\s+Pers\.Nr\./);
    let name = match ? match[1].trim() : `page-${i}`;
    name = name.replace(/[^a-z0-9_\-]/gi, "_");

    // Create new PDF with one page
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(fullDoc, [i - 1]);
    newDoc.addPage(copiedPage);

    const pdfBytes = await newDoc.save();

    // Download directly
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.pdf`;
    link.click();
  }
}
