# StundenPlanMergerBFO

StundenPlanMergerBFO is a **browser-based PDF processing tool** for teacher timetables.  
It allows extracting individual teacher schedules into separate PDFs or merging selected schedules into a single PDF — fully **offline and client-side**.

No server, no upload, no installation required.

---

## Features

- Drag & drop or select a PDF containing multiple teacher timetables
- Enter multiple teacher identifiers (Visa numbers)
- Generate **individual PDFs** per teacher and download them as a ZIP
- Generate a **single merged PDF** containing selected schedules
- Light mode / dark mode toggle
- Works fully offline (all processing happens in the browser)

---

## Browser Installation (Recommended)

The easiest way to use the application is via the **prebuilt browser release**.

### 1. Download

Download the file:

```
BrowserVersion.zip
```

---

### 2. Extract

1. Extract `BrowserVersion.zip`
2. Inside the extracted folder you will find a **`src`** directory

Do **not** open the application directly from inside the ZIP file.

---

### 3. Start the application

1. Open the extracted `src` folder
2. Double-click **`index.html`**

This file automatically **redirects to the actual application entry point**.

- Works via `file://`
- No local server required
- No internet connection required

---

## Usage

1. Open the application in your browser
2. Drag & drop a timetable PDF
3. Enter one or more teacher Visa numbers
4. Choose:
   - **ZIP with single PDFs**
   - **Merged PDF**
5. Click **Submit**
6. Download starts automatically

---

## Dependencies

All libraries are bundled locally:

- pdf.js
- pdf-lib
- JSZip
- FileSaver.js

---

## License

MIT License
