export class FlowField {
	cols: number;
	rows: number;
	resolution: number;
	angles: number[];
	time: number;

	constructor(width: number, height: number, resolution: number = 20) {
		this.resolution = resolution;
		this.cols = Math.ceil(width / resolution);
		this.rows = Math.ceil(height / resolution);
		this.angles = new Array(this.cols * this.rows).fill(0);
		this.time = 0;
	}

	resize(width: number, height: number) {
		this.cols = Math.ceil(width / this.resolution);
		this.rows = Math.ceil(height / this.resolution);
		this.angles = new Array(this.cols * this.rows).fill(0);
	}

	update(deltaTime: number) {
		this.time += deltaTime * 0.0003;
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				const index = y * this.cols + x;
				// Layered sinusoidal noise to approximate organic flow
				this.angles[index] =
					Math.sin(x * 0.12 + this.time) * Math.cos(y * 0.12 + this.time * 0.71) * Math.PI * 2 +
					Math.sin(x * 0.06 - this.time * 0.53 + y * 0.04) * Math.PI;
			}
		}
	}

	getAngleAt(x: number, y: number): number {
		const col = Math.max(0, Math.min(Math.floor(x / this.resolution), this.cols - 1));
		const row = Math.max(0, Math.min(Math.floor(y / this.resolution), this.rows - 1));
		return this.angles[row * this.cols + col] ?? 0;
	}
}

export class Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	hue: number;
	speed: number;
	history: Array<{ x: number; y: number }>;
	maxHistory: number;

	constructor(x: number, y: number, hue?: number) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.maxLife = 120 + Math.random() * 120;
		this.life = this.maxLife;
		this.hue = hue ?? Math.random() * 360;
		this.speed = 1.2 + Math.random() * 2;
		this.history = [];
		this.maxHistory = 25;
	}

	update(field: FlowField) {
		const angle = field.getAngleAt(this.x, this.y);
		this.vx = Math.cos(angle) * this.speed;
		this.vy = Math.sin(angle) * this.speed;

		this.history.push({ x: this.x, y: this.y });
		if (this.history.length > this.maxHistory) {
			this.history.shift();
		}

		this.x += this.vx;
		this.y += this.vy;
		this.life--;
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.history.length < 2) return;

		const alpha = (this.life / this.maxLife) * 0.85;
		const first = this.history[0];
		if (!first) return;
		ctx.beginPath();
		ctx.moveTo(first.x, first.y);
		for (let i = 1; i < this.history.length; i++) {
			const point = this.history[i];
			if (point) ctx.lineTo(point.x, point.y);
		}
		ctx.lineTo(this.x, this.y);

		ctx.strokeStyle = `hsla(${this.hue}, 75%, 65%, ${alpha})`;
		ctx.lineWidth = alpha * 1.8;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.stroke();
	}

	isDead(canvasWidth: number, canvasHeight: number): boolean {
		return (
			this.life <= 0 ||
			this.x < -10 ||
			this.x > canvasWidth + 10 ||
			this.y < -10 ||
			this.y > canvasHeight + 10
		);
	}
}
