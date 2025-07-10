import { writable } from 'svelte/store';

export interface PhysicsParams {
	gravity: number;
	minJumpForce: number;
	maxJumpForce: number;
	jumpHoldTime: number;
	jumpBufferTime: number;
	friction: number;
	maxSpeed: number;
	movementLerp: number;
	airCoefficient: number;
}

export const defaultPhysicsParams: PhysicsParams = {
	gravity: 150,
	minJumpForce: 60,
	maxJumpForce: 90,
	jumpHoldTime: 300,
	jumpBufferTime: 100,
	friction: 0.4,
	maxSpeed: 110,
		movementLerp: 0.5,
	airCoefficient: 0.6
};

export const physicsParams = writable<PhysicsParams>(defaultPhysicsParams);

export const parameterRanges = {
	gravity: { min: 10, max: 200, step: 5 },
			minJumpForce: { min: 10, max: 180, step: 1 },
	maxJumpForce: { min: 30, max: 250, step: 1 },
	jumpHoldTime: { min: 100, max: 800, step: 50 },
	jumpBufferTime: { min: 50, max: 300, step: 25 },
	friction: { min: 0, max: 0.95, step: 0.05 },
	maxSpeed: { min: 50, max: 300, step: 10 },
		movementLerp: { min: 0.02, max: 0.95, step: 0.02 },
	airCoefficient: { min: 0, max: 1, step: 0.05 }
};
