import type { InputHandler } from './input-handling';
import { physicsParams } from './physics-params';
import { get } from 'svelte/store';

class Shape {
	x: number;
	y: number;
	size: number;
	color: string;

	constructor(x: number, y: number, size: number, color: string) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = color;
	}
}

class SVGToImage extends Shape {
	svg: SVGElement;
	paths: Array<SVGPathElement>;
	image: HTMLImageElement;
	isLoaded: boolean;

	constructor(
		x: number,
		y: number,
		size: number,
		color: string,
		viewBox: string,
		paths: Array<string>
	) {
		super(x, y, size, color);
		this.isLoaded = false;

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', viewBox);

		paths.forEach((path) => {
			const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			newPath.setAttribute('d', path);

			this.svg.appendChild(newPath);
		});

		this.paths = Array.from(this.svg.querySelectorAll('path'));

		this.image = new Image();

		this.paths.forEach((path) => {
			path.setAttribute('fill', this.color);
		});

		this.serialize();
	}

	serialize() {
		const serializer = new XMLSerializer();
		const svgStr = serializer.serializeToString(this.svg);
		const encodedData = 'data:image/svg+xml;base64,' + btoa(svgStr);

		this.image.src = encodedData;
	}

	whenReady(callback: () => void) {
		if (this.isLoaded) {
			callback();
		} else {
			this.image.onload = () => {
				this.isLoaded = true;
				callback();
			};
		}
	}
}



export class MovingShape extends Shape {
	dx: number;
	dy: number;
	grounded: boolean;
	velocityY: number;
	velocityX: number;
	isJumping: boolean;
	jumpStartTime: number;

	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color);
		this.dx = 0;
		this.dy = 0;
		this.grounded = true;
		this.velocityY = 0;
		this.velocityX = 0;
		this.isJumping = false;
		this.jumpStartTime = 0;
	}

			move(inputHandler: InputHandler, deltaTime: number) {
		const inputs = inputHandler.handleInputs();
		const adjustedDeltaTime = deltaTime * 0.01;

		this.#checkMovementDirection(inputs);
		this.#handleMove(adjustedDeltaTime);

		this.#handleGravity(adjustedDeltaTime);
		this.#checkBoundaries(inputHandler.canvas);
		this.#handleJump(inputHandler, adjustedDeltaTime);
	}

	#checkMovementDirection(inputs: Set<string>) {
		if (inputs.has('Left')) {
			this.dx = -1;
		} else if (inputs.has('Right')) {
			this.dx = 1;
		} else {
			this.dx = 0;
		}
	}

	#checkBoundaries(canvas: HTMLCanvasElement) {
		if (this.x - this.size / 2 < 0) {
			this.x = this.size / 2;
		}

		if (this.x + this.size / 2 > canvas.width) {
			this.x = canvas.width - this.size / 2;
		}

		if (this.y - this.size / 2 < 0) {
			this.y = this.size / 2;
		}

				if (this.y + this.size / 2 > canvas.height) {
			this.y = canvas.height - this.size / 2;
			this.velocityY = 0;
			this.grounded = true;
			this.isJumping = false;
		} else {
			this.grounded = false;
		}
	}

		#handleGravity(adjustedDeltaTime: number) {
		const params = get(physicsParams);
		this.velocityY += params.gravity * adjustedDeltaTime;
		this.y += this.velocityY * adjustedDeltaTime;
	}

								#handleJump(inputHandler: InputHandler, deltaTime: number) {
		const params = get(physicsParams);

		// Start jump immediately when button is first pressed
		if (this.grounded && inputHandler.isJumpPressed()) {
			this.velocityY -= params.minJumpForce;
			this.grounded = false;
			this.isJumping = true;
			this.jumpStartTime = Date.now();
			inputHandler.consumeJump();
		}

								// Continue applying upward force while jump is held (variable jump height)
		if (this.isJumping && inputHandler.jumpPressed && this.velocityY < 0) {
			const jumpDuration = Date.now() - this.jumpStartTime;
			if (jumpDuration < params.jumpHoldTime) {
								// Calculate how much additional force to apply this frame using deltaTime
				const totalAdditionalForce = params.maxJumpForce - params.minJumpForce;
				const forcePerSecond = (totalAdditionalForce * 1000) / params.jumpHoldTime; // Force per second
				const additionalForce = forcePerSecond * deltaTime; // Frame-rate independent
				this.velocityY -= additionalForce;
			} else {
				this.isJumping = false;
			}
		}

		// Stop applying force when button is released
		if (!inputHandler.jumpPressed) {
			this.isJumping = false;
		}
	}

					#handleMove(adjustedDeltaTime: number) {
		const params = get(physicsParams);

		// Calculate target velocity based on input
		let targetVelocityX = this.dx * params.maxSpeed;

		// Apply air coefficient for reduced air control
		if (!this.grounded) {
			targetVelocityX *= params.airCoefficient;
		}

		if (this.dx !== 0) {
			// Smooth interpolation towards target velocity
			this.velocityX = this.#lerp(this.velocityX, targetVelocityX, params.movementLerp);
		} else if (this.grounded) {
			// Apply friction only when on the ground
			this.velocityX *= (1 - params.friction);
		}

		this.x += this.velocityX * adjustedDeltaTime;
	}

	#lerp(start: number, end: number, factor: number): number {
		return start + (end - start) * factor;
	}
}

export class MovingCircle extends MovingShape {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
		ctx.fill();
	}
}

export class Triangle extends Shape {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const x = this.x - this.size / 2;
		const y = this.y + this.size / 2;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + this.size, y);
		ctx.lineTo(x + this.size / 2, y - this.size);
		ctx.fill();
	}
}

export class Circle extends Shape {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
		ctx.fill();
	}
}

export class Square extends Shape {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
		ctx.fill();
	}
}

export class Heart extends SVGToImage {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color, '0 0 30 30', [
			'M15 6.152C18.158.284 24.474.284 27.632 3.218s3.158 8.801 0 14.668c-2.211 4.4-7.895 8.801-12.632 11.734-4.737-2.933-10.421-7.334-12.632-11.734-3.157-5.867-3.157-11.734 0-14.668S11.842.284 15 6.152z'
		]);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.whenReady(() => {
			ctx.drawImage(
				this.image,
				this.x - this.size / 2,
				this.y - this.size / 2,
				this.size,
				this.size
			);
		});
	}
}

export class Star extends SVGToImage {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color, '0, 0, 30, 30', [
			'M14.993 0l3.538 11.438h11.452l-9.264 7.068 3.538 11.438-9.264-7.069-9.265 7.069 3.539-11.438-9.265-7.068h11.452L14.993 0z'
		]);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.whenReady(() => {
			ctx.drawImage(
				this.image,
				this.x - this.size / 2,
				this.y - this.size / 2,
				this.size,
				this.size
			);
		});
	}
}

export class Clear extends SVGToImage {
	constructor(x: number, y: number, size: number, color: string) {
		super(x, y, size, color, '0, 0, 30, 30', [
			'M11.578,13.974l-9.359,-11.461l7.166,-0l5.802,7.282l5.909,-7.282l7.38,-0l-9.626,11.461l11.15,13.513l-7.166,0l-7.647,-9.333l-7.834,9.333l-7.353,0l11.578,-13.513Z'
		]);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.whenReady(() => {
			ctx.drawImage(
				this.image,
				this.x - this.size / 2,
				this.y - this.size / 2,
				this.size,
				this.size
			);
		});
	}
}
