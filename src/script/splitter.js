document.addEventListener("DOMContentLoaded", () => {
  // Make sure PDF-lib is available
  const { PDFDocument } = window.PDFLib || {};
  if (!PDFDocument) {
    console.error("PDF-lib not loaded! Check the script tag in index.html.");
    return;
  }

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const splitButton = document.getElementById("submit");

  let selectedFile = null;

  // File selection via input
  fileInput.addEventListener("change", (e) => {
    if (!e.target.files.length) return;
    selectedFile = e.target.files[0];
    console.log("Selected file:", selectedFile.name);
  });

  // Click dropZone to open file dialog
  dropZone.addEventListener("click", () => fileInput.click());

  // Prevent default drag behaviors for the document
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    document.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  // Highlight dropZone when dragging over
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
  });

  // Split button
  splitButton.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please select a PDF first!");
    if (selectedFile.type !== "application/pdf") return alert("Please select a PDF file!");
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      await splitPdf(arrayBuffer);
    } catch (err) {
      console.error("Error splitting PDF:", err);
      alert("Failed to split PDF. See console for details.");
    }
  });

  async function splitPdf(arrayBuffer) {
    const rawPdf = new Uint8Array(arrayBuffer);

    // Load PDF for text extraction
    const pdfDoc = await PDFDocument.load(rawPdf);
    const pdfTextDoc = await pdfjsLib.getDocument({ data: rawPdf }).promise;

    const numPages = pdfTextDoc.numPages;
    console.log(`PDF has ${numPages} pages.`);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfTextDoc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(it => it.str).join(" ");

      // Extract name before "Pers.Nr."
      let match = text.match(/^(.*?)\s+Pers\.Nr\./);
      let name = match ? match[1].trim() : `page-${i}`;

      // Sanitize filename
      name = name.replace(/[^a-z0-9_\-]/gi, "_");

      // Create new PDF with this page
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [i - 1]);
      newDoc.addPage(copiedPage);

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.pdf`;
      link.click();

      // Free memory
      URL.revokeObjectURL(url);

      console.log(`Saved page ${i} as ${name}.pdf`);
    }

    console.log("PDF splitting complete!");
    alert("PDF split successfully!");
  }
});
