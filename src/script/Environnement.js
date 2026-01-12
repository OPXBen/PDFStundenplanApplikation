export class Environnement {
	constructor() {
		this.isTauriApp =
			typeof window !== "undefined" &&
			"__TAURI__" in window;
	}

	isDesktopApp() {
		return this.isTauriApp === true;
	}

	isBrowser() {
		return this.isTauriApp === false;
	}

	downloadMessage(message) {
		console.log(message);

		if (this.isDesktopApp()) {
			this.noBreakMessage(message);
		}
	}

	noBreakMessage(message) {
		// Delay avoids blocking the save dialog
		setTimeout(() => {
			alert(message);
		}, 200);
	}
}