export const inputs = {
	ArrowUp: 'Up',
	w: 'Up',
	ArrowLeft: 'Left',
	a: 'Left',
	ArrowDown: 'Down',
	s: 'Down',
	ArrowRight: 'Right',
	d: 'Right',
	' ': 'Jump',
	z: 'Jump'
};

export class InputHandler {
	canvas: HTMLCanvasElement;
	possibleInputs: { [key: string]: string };
	currentInputs: Set<string>;
	jumpPressed: boolean;
	jumpWasPressed: boolean;
	jumpHoldTime: number;
	jumpHoldStart: number;
	jumpBuffered: boolean;
	jumpBufferTime: number;

	constructor(canvas: HTMLCanvasElement, possibleInputs: { [key: string]: string } = inputs) {
		this.canvas = canvas;
		this.currentInputs = new Set();
		this.possibleInputs = possibleInputs;
		this.jumpPressed = false;
		this.jumpWasPressed = false;
		this.jumpHoldTime = 0;
		this.jumpHoldStart = 0;
		this.jumpBuffered = false;
		this.jumpBufferTime = 0;

		this.#listenKeyDown();
		this.#listenKeyUp();
	}

		#listenKeyDown() {
		document.addEventListener('keydown', (event) => {
			const action = this.possibleInputs[event.key];
			if (!action) return;

			if (action === 'Jump') {
				this.jumpPressed = true;
			} else {
				this.currentInputs.add(action);
			}
		});
	}

		#listenKeyUp() {
		document.addEventListener('keyup', (event) => {
			const action = this.possibleInputs[event.key];
			if (!action) return;

			if (action === 'Jump') {
				this.jumpPressed = false;
				this.jumpWasPressed = false;
			} else if (this.currentInputs.has(action)) {
				this.currentInputs.delete(action);
			}
		});
	}

		handleInputs() {
		return this.currentInputs;
	}

	isJumpPressed() {
		if (this.jumpPressed && !this.jumpWasPressed) {
			this.jumpWasPressed = true;
			return true;
		}
		return false;
	}
}
