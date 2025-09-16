# StundenPlanMergerBFO

StundenPlanMergerBFO is a browser-based tool for processing teacher timetable PDFs. It allows users to extract individual teacher schedules into separate PDFs or merge selected schedules into a single PDF. The application can also generate a ZIP containing multiple PDFs for easy download.

---

## Features

* Drag and drop or select a PDF containing multiple teacher timetables.
* Enter multiple teacher names (Visa numbers or identifiers) to filter schedules.
* Generate **individual PDFs** for each selected teacher and download as a ZIP.
* Generate a **merged PDF** containing all selected teacher schedules.
* Light mode / dark mode toggle.

---

## Demo

<img src="src/img/moon.png" alt="demoXY" width="200"/><br>
*WIP screenshots and Videos will come in the Future*

---

## Installation

This project is fully client-side and runs in modern browsers. No server setup is required.

1. Clone the repository:

```bash
git clone https://github.com/OPXBen/PDFStundenplanApplikation
cd StundenPlanMergerBFO
```

2. Open `src/html/index.html` in your browser.

> ⚠ Make sure you have an active internet connection for the external libraries via CDN: `pdf.js`, `pdf-lib`, `JSZip`, and `FileSaver.js`.

---

## Usage

1. Open the tool in your browser.
2. Drag and drop a PDF containing teacher timetables into the drop zone or click to select a file.
3. Enter teacher names (Visa numbers) in the input field. You can enter multiple names.
4. Choose one of the PDF options:

   * **Single PDFs in ZIP** – Each teacher schedule saved as a separate PDF.
   * **Merged PDF** – All selected schedules combined into a single PDF.
5. Click **Submit**.
6. Download will start automatically once processing is complete.
---

## Dependencies

All libraries are loaded via CDN:

* [pdf.js](https://github.com/mozilla/pdf.js) – Apache-2.0
* [pdf-lib](https://github.com/Hopding/pdf-lib) – MIT
* [JSZip](https://stuk.github.io/jszip/) – MIT/GPLv3
* [FileSaver.js](https://github.com/eligrey/FileSaver.js) – MIT

---

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.

Third-party library licenses are listed in [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md).

---

## Notes

* Works in modern browsers (Chrome, Firefox, Edge, Safari).
* Large PDFs may take a few seconds to process depending on browser and machine performance.
* This project does not store any uploaded PDFs; all processing happens in the browser.
