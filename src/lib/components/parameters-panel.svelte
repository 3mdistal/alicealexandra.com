<script lang="ts">
	import { physicsParams, parameterRanges, defaultPhysicsParams } from '$lib/arcade/physics-params';
	import type { PhysicsParams } from '$lib/arcade/physics-params';

	export let isOpen: boolean = false;

	let currentParams: PhysicsParams;

	physicsParams.subscribe(params => {
		currentParams = { ...params };
	});

	function updateParam(key: keyof PhysicsParams, value: number) {
		currentParams[key] = value;
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
		const labels = {
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
		return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
	}

	function getParameterTooltip(key: keyof PhysicsParams): string {
		const tooltips = {
			gravity: 'How fast the character falls downward',
			minJumpForce: 'Jump strength when tapping the jump button briefly',
			maxJumpForce: 'Maximum jump strength when holding the jump button',
			jumpHoldTime: 'How long to hold jump button for maximum height',
			jumpBufferTime: 'Grace period to press jump before landing',
			friction: 'How quickly the character stops when not moving',
			maxSpeed: 'Maximum horizontal movement speed',
			movementLerp: 'How smooth acceleration/deceleration feels',
			airCoefficient: 'How much control you have while airborne (0 = none, 1 = full)'
		};
		return tooltips[key] || '';
	}
</script>

<div class="parameters-panel" class:open={isOpen}>
	<div class="panel-header">
		<h3>Physics Parameters</h3>
		<button class="reset-button" on:click={resetToDefaults}>Reset</button>
	</div>
	
	<div class="parameters-list">
		{#each Object.entries(parameterRanges) as [key, range]}
						<div class="parameter-group">
								<label for={key}>{getParameterLabel(key)}</label>
				<div class="slider-container">
					<input
						type="range"
						id={key}
						min={range.min}
						max={range.max}
						step={range.step}
						value={currentParams[key]}
						on:input={(e) => updateParam(key, parseFloat(e.target.value))}
						class="parameter-slider"
					/>
					<span class="parameter-value">
						{formatValue(key, currentParams[key])}
					</span>
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
		width: 300px;
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid #333;
		border-radius: 8px;
		padding: 20px;
		z-index: 1000;
		transition: left 0.3s ease-in-out;
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
		background: #333;
		color: white;
		border: 1px solid #555;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		font-family: monospace;
		transition: background 0.2s;
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

		.parameter-group label {
		font-size: 12px;
		color: #ccc;
		text-transform: capitalize;
		font-family: monospace;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.parameter-slider {
		flex: 1;
		height: 4px;
		background: #333;
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}

	.parameter-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
	}

	.parameter-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
	}

		.parameter-value {
		font-size: 12px;
		color: #fff;
		min-width: 40px;
		text-align: right;
		font-family: monospace;
	}
</style>
