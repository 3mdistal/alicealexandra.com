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
	gravity: 105,
	minJumpForce: 60,
	maxJumpForce: 192,
	jumpHoldTime: 150,
	jumpBufferTime: 100,
	friction: 0.4,
	maxSpeed: 150,
	movementLerp: 0.5,
	airCoefficient: 0.6
};

export const physicsParams = writable<PhysicsParams>(defaultPhysicsParams);

type ParameterRange = { min: number; max: number; step: number };

export const parameterRanges: Record<keyof PhysicsParams, ParameterRange> = {
	gravity: { min: 10, max: 200, step: 5 },
	minJumpForce: { min: 10, max: 180, step: 1 },
	maxJumpForce: { min: 30, max: 250, step: 1 },
	jumpHoldTime: { min: 50, max: 500, step: 10 },
	jumpBufferTime: { min: 50, max: 300, step: 25 },
	friction: { min: 0, max: 0.95, step: 0.05 },
	maxSpeed: { min: 50, max: 300, step: 10 },
	movementLerp: { min: 0.02, max: 0.95, step: 0.02 },
	airCoefficient: { min: 0, max: 1, step: 0.05 }
};
