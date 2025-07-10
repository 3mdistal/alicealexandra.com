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
	gravity: 50,
	minJumpForce: 73,
	maxJumpForce: 117,
	jumpHoldTime: 300,
	jumpBufferTime: 100,
	friction: 0.4,
	maxSpeed: 37,
	movementLerp: 0.5,
	airCoefficient: 0.8
};

export const physicsParams = writable<PhysicsParams>(defaultPhysicsParams);

export const parameterRanges = {
	gravity: { min: 3, max: 67, step: 2 },
	minJumpForce: { min: 17, max: 100, step: 3 },
	maxJumpForce: { min: 50, max: 167, step: 3 },
	jumpHoldTime: { min: 100, max: 800, step: 50 },
	jumpBufferTime: { min: 50, max: 300, step: 25 },
	friction: { min: 0, max: 0.95, step: 0.05 },
	maxSpeed: { min: 17, max: 100, step: 3 },
	movementLerp: { min: 0.1, max: 1, step: 0.05 },
	airCoefficient: { min: 0, max: 1, step: 0.05 }
};
