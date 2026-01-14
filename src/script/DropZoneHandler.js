class DropZoneHandler {
	constructor({
		zoneId,             // ID of drop zone element
		fileType = "pdf",    // "pdf" or "visa"
		onFileSelected = null // optional callback when a file is selected
	}) {
		this.env = new Environnement();
		this.zone = document.getElementById(zoneId);
		this.fileType = fileType;
		this.onFileSelected = onFileSelected;
		this.selectedFile = null;

		if (!this.zone) {
			console.error(`DropZoneHandler: element with id '${zoneId}' not found`);
			return;
		}

		this.initBrowserDrop();
		this.initDesktopDrop();
		this.zone.addEventListener("click", () => this.openFileDialog());
	}

	// -----------------------------
	// Browser drag & drop
	// -----------------------------
	initBrowserDrop() {
		const zone = this.zone;

		["dragenter", "dragover", "dragleave", "drop"].forEach(evt =>
			zone.addEventListener(evt, e => e.preventDefault())
		);

		zone.addEventListener("dragover", () => zone.classList.add("highlight"));
		zone.addEventListener("dragleave", () => zone.classList.remove("highlight"));
		zone.addEventListener("drop", async (e) => {
			zone.classList.remove("highlight");
			const files = e.dataTransfer.files;
			if (!files || !files.length) return;
			await this.handleFile(files[0]);
		});
	}

	// -----------------------------
	// Desktop Tauri drop
	// -----------------------------
	async initDesktopDrop() {
		if (!this.env.isDesktopApp()) return;

		const { listen } = await import("@tauri-apps/api/event");
		const { readBinaryFile, readTextFile } = await import("@tauri-apps/api/fs");
		const { basename } = await import("@tauri-apps/api/path");

		listen("tauri://file-drop", async (event) => {
			const paths = event.payload;
			if (!paths?.length) return;
			const filePath = paths[0];
			const ext = filePath.split('.').pop().toLowerCase();

			if (this.fileType === "pdf" && ext === "pdf") {
				const bytes = await readBinaryFile(filePath);
				const name = await basename(filePath);
				this.selectedFile = {
					name,
					type: "application/pdf",
					arrayBuffer: async () => bytes.buffer
				};
				this.zone.textContent = `Selected: ${name}`;
				if (this.onFileSelected) this.onFileSelected(this.selectedFile);
			} else if (this.fileType === "visa") {
				const content = await readTextFile(filePath);
				await this.parseVisaText(content);
			}
		});
	}

	// -----------------------------
	// File dialog (browser only)
	// -----------------------------
	openFileDialog() {
		if (this.env.isDesktopApp()) return; // optional: desktop uses OS drop
		const input = document.createElement("input");
		input.type = "file";
		input.accept = this.fileType === "pdf" ? ".pdf" : ".txt";
		input.onchange = async () => {
			if (input.files && input.files.length) {
				await this.handleFile(input.files[0]);
			}
		};
		input.click();
	}

	// -----------------------------
	// Handle file (browser + desktop unified)
	// -----------------------------
	async handleFile(file) {
		if (this.fileType === "pdf") {
			this.selectedFile = file;
			this.zone.textContent = `Selected: ${file.name}`;
			console.log("PDF selected:", file.name);
			if (this.onFileSelected) this.onFileSelected(file);
		} else if (this.fileType === "visa") {
			const text = await file.text();
			await this.parseVisaText(text);
		}
	}

	// -----------------------------
	// Parse visa text into global array
	// -----------------------------
	async parseVisaText(content) {
		const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l);
		if (!window.visaArray) window.visaArray = [];
		lines.forEach(v => {
			const visa = v.split(/\s+/)[0].toUpperCase();
			if (!window.visaArray.includes(visa)) window.visaArray.push(visa);
		});
		this.renderVisaList();
	}

	renderVisaList() {
		const ul = document.getElementById('listVisa');
		if (!ul) return;
		ul.innerHTML = '';
		window.visaArray.forEach((visa, idx) => {
			const li = document.createElement('li');
			li.textContent = visa;
			li.style.cursor = 'pointer';
			li.title = 'Click to remove';
			li.onclick = () => {
				window.visaArray.splice(idx, 1);
				this.renderVisaList();
			};
			ul.appendChild(li);
		});
	}
}

window.DropZoneHandler = DropZoneHandler;