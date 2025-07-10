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
	gravity: 70,
	minJumpForce: 150,
	maxJumpForce: 250,
	jumpHoldTime: 300,
	jumpBufferTime: 100,
	friction: 0.4,
	maxSpeed: 100,
	movementLerp: 0.8,
	airCoefficient: 0.6
};

export const physicsParams = writable<PhysicsParams>(defaultPhysicsParams);

export const parameterRanges = {
	gravity: { min: 10, max: 200, step: 5 },
	minJumpForce: { min: 50, max: 300, step: 10 },
	maxJumpForce: { min: 150, max: 500, step: 10 },
	jumpHoldTime: { min: 100, max: 800, step: 50 },
	jumpBufferTime: { min: 50, max: 300, step: 25 },
	friction: { min: 0, max: 0.95, step: 0.05 },
	maxSpeed: { min: 50, max: 300, step: 10 },
	movementLerp: { min: 0.1, max: 1, step: 0.05 }
};
