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
	jumpConsumed: boolean;

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
		this.jumpConsumed = false;

		this.#listenKeyDown();
		this.#listenKeyUp();
	}

			#listenKeyDown() {
		document.addEventListener('keydown', (event) => {
			const action = this.possibleInputs[event.key];
			if (!action) return;

			if (action === 'Jump' && !this.jumpPressed) {
				this.jumpPressed = true;
				this.jumpHoldStart = Date.now();
				this.jumpBuffered = true;
				this.jumpBufferTime = Date.now();
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
				this.jumpHoldTime = Date.now() - this.jumpHoldStart;
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

	isJumpBuffered(bufferTimeMs: number) {
		if (this.jumpBuffered && Date.now() - this.jumpBufferTime <= bufferTimeMs) {
			this.jumpBuffered = false;
			return true;
		}
		return false;
	}

	getJumpHoldRatio(maxHoldTimeMs: number) {
		if (this.jumpPressed) {
			const currentHoldTime = Date.now() - this.jumpHoldStart;
			return Math.min(currentHoldTime / maxHoldTimeMs, 1);
		}
		return Math.min(this.jumpHoldTime / maxHoldTimeMs, 1);
	}

	consumeJump() {
		this.jumpBuffered = false;
		this.jumpWasPressed = true;
	}
}
