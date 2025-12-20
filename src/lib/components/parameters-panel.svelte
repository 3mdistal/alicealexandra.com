<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		defaultPhysicsParams,
		parameterRanges,
		physicsParams,
		type PhysicsParams
	} from '$lib/arcade/physics-params';

	export let isOpen: boolean = false;

	type ParameterRange = { min: number; max: number; step: number };

	let currentParams: PhysicsParams = { ...defaultPhysicsParams };

	const unsubscribe = physicsParams.subscribe((params) => {
		currentParams = { ...params };
	});

	onDestroy(unsubscribe);

	function updateParam(key: keyof PhysicsParams, value: number) {
		currentParams = { ...currentParams, [key]: value };
		physicsParams.set(currentParams);
	}

	function resetToDefaults() {
		currentParams = { ...defaultPhysicsParams };
		physicsParams.set(currentParams);
	}

	function formatValue(key: keyof PhysicsParams, value: number): string {
		if (key === 'friction' || key === 'movementLerp' || key === 'airCoefficient') {
			return value.toFixed(2);
		}
		return value.toString();
	}

	function getParameterLabel(key: keyof PhysicsParams): string {
		const labels: Record<keyof PhysicsParams, string> = {
			gravity: 'Gravity',
			minJumpForce: 'Min Jump Force',
			maxJumpForce: 'Max Jump Force',
			jumpHoldTime: 'Jump Hold Time (ms)',
			jumpBufferTime: 'Jump Buffer (ms)',
			friction: 'Friction',
			maxSpeed: 'Max Speed',
			movementLerp: 'Movement Smoothing',
			airCoefficient: 'Air Control'
		};
		return labels[key];
	}

	function getParameterTooltip(key: keyof PhysicsParams): string {
		const tooltips: Record<keyof PhysicsParams, string> = {
			gravity: 'How fast the character falls downward.',
			minJumpForce: 'Jump strength when tapping the jump button briefly.',
			maxJumpForce: 'Maximum jump strength when holding the jump button.',
			jumpHoldTime: 'How long to hold jump button for maximum height.',
			jumpBufferTime: 'Grace period to press jump before landing.',
			friction: 'How quickly the character stops when not moving.',
			maxSpeed: 'Maximum horizontal movement speed.',
			movementLerp: 'How smooth acceleration/deceleration feels.',
			airCoefficient: 'How much control you have while airborne (0 = none, 1 = full).'
		};
		return tooltips[key];
	}

	const parameterEntries = Object.entries(parameterRanges) as [
		keyof PhysicsParams,
		ParameterRange
	][];
</script>

<div class="parameters-panel" class:open={isOpen}>
	<div class="panel-header">
		<h3>Physics Parameters</h3>
		<button class="reset-button" on:click={resetToDefaults}>Reset</button>
	</div>

	<div class="parameters-list">
		{#each parameterEntries as [key, range]}
			<div class="parameter-group">
				<div class="label-container">
					<label for={key}>{getParameterLabel(key)}</label>
					<div class="info-container">
						<span class="info-icon">i</span>
						<div class="tooltip">{getParameterTooltip(key)}</div>
					</div>
				</div>
				<div class="slider-container">
					<input
						type="range"
						id={key}
						min={range.min}
						max={range.max}
						step={range.step}
						value={currentParams[key]}
						on:input={(e) =>
							updateParam(key, parseFloat((e.currentTarget as HTMLInputElement).value))}
						class="parameter-slider"
					/>
					<span class="parameter-value">{formatValue(key, currentParams[key])}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.parameters-panel {
		position: fixed;
		top: 50%;
		left: -320px;
		transform: translateY(-50%);
		z-index: 1000;
		transition: left 0.3s ease-in-out;
		border: 2px solid #333;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.9);
		padding: 20px;
		width: 300px;
		color: white;
		font-family: monospace;
	}

	.parameters-panel.open {
		left: 20px;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #333;
		padding-bottom: 10px;
	}

	.panel-header h3 {
		margin: 0;
		color: #fff;
		font-size: 16px;
		font-family: monospace;
	}

	.reset-button {
		transition: background 0.2s;
		cursor: pointer;
		border: 1px solid #555;
		border-radius: 4px;
		background: #333;
		padding: 4px 8px;
		color: white;
		font-size: 12px;
		font-family: monospace;
	}

	.reset-button:hover {
		background: #555;
	}

	.parameters-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.parameter-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.label-container {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.parameter-group label {
		color: #ccc;
		font-size: 12px;
		font-family: monospace;
		text-transform: capitalize;
	}

	.info-container {
		display: inline-block;
		position: relative;
	}

	.info-icon {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: background 0.2s;
		cursor: help;
		border-radius: 50%;
		background: #555;
		width: 14px;
		height: 14px;
		color: #ccc;
		font-style: italic;
		font-size: 10px;
		font-family: monospace;
	}

	.info-icon:hover {
		background: #777;
		color: #fff;
	}

	.tooltip {
		position: absolute;
		bottom: 120%;
		left: 50%;
		transform: translateX(-50%);
		visibility: hidden;
		opacity: 0;
		z-index: 1002;
		transition:
			opacity 0.2s,
			visibility 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		border: 1px solid #555;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.95);
		padding: 8px 12px;
		width: 200px;
		color: white;
		font-size: 11px;
		font-family: monospace;
		text-align: left;
		word-wrap: break-word;
	}

	.tooltip::after {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.95);
		content: '';
	}

	.info-container:hover .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.parameter-slider {
		flex: 1;
		cursor: pointer;
		outline: none;
		border-radius: 2px;
		background: #333;
		height: 4px;
	}

	.parameter-slider::-webkit-slider-thumb {
		appearance: none;
		cursor: pointer;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		background: white;
		width: 16px;
		height: 16px;
	}

	.parameter-slider::-moz-range-thumb {
		cursor: pointer;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
		border: none;
		border-radius: 50%;
		background: white;
		width: 16px;
		height: 16px;
	}

	.parameter-value {
		min-width: 40px;
		color: #fff;
		font-size: 12px;
		font-family: monospace;
		text-align: right;
	}
</style>
