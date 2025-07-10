import { writable } from 'svelte/store';

export interface PhysicsParams {
	gravity: number;
	jumpForce: number;
	friction: number;
	acceleration: number;
	maxSpeed: number;
	airCoefficient: number;
}

export const defaultPhysicsParams: PhysicsParams = {
	gravity: 70,
	jumpForce: 200,
	friction: 0.4,
	acceleration: 100,
	maxSpeed: 100
};

export const physicsParams = writable<PhysicsParams>(defaultPhysicsParams);

export const parameterRanges = {
	gravity: { min: 10, max: 200, step: 5 },
	jumpForce: { min: 50, max: 500, step: 10 },
	friction: { min: 0, max: 0.95, step: 0.05 },
	acceleration: { min: 20, max: 300, step: 10 },
	maxSpeed: { min: 20, max: 200, step: 5 }
};
