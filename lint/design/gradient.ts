import valueParser, { type Node } from 'postcss-value-parser';
import { parseColor, sameColor, type Rgba } from './color.ts';

/** A `*-gradient()` call in a CSS value. Offsets are within the value. */
export interface Gradient {
	start: number;
	end: number;
	/** Whether it names the color space it blends in, like `in oklab`. */
	hasColorSpace: boolean;
	/** Where `in srgb` goes, and the exact text to insert there. */
	colorSpaceInsert: { at: number; text: string };
	/** The node that starts each color stop: the stop's color. */
	stops: Node[];
}

const GRADIENT = /^(repeating-)?(linear|radial|conic)-gradient$/i;
/** Colors the gradient spec calls legacy. A gradient of only these blends in sRGB. */
const LEGACY_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb']);
const MODERN_FUNCTIONS = new Set(['lab', 'lch', 'oklab', 'oklch', 'color', 'color-mix']);

/** Finds every gradient in a value, with its color stops and where its color space is or would go. */
export function findGradients(value: string): Gradient[] {
	const gradients: Gradient[] = [];
	valueParser(value).walk((node) => {
		if (node.type !== 'function' || !GRADIENT.test(node.value)) return undefined;
		const args = splitArguments(node.nodes);
		const first = args[0] ?? [];
		const head = first[0];
		// The first argument is the direction, shape or position unless it starts with a color.
		const hasSetup = head !== undefined && !startsStop(head);
		const setupEnd = first.at(-1)?.sourceEndIndex ?? node.sourceIndex;
		gradients.push({
			start: node.sourceIndex,
			end: node.sourceEndIndex,
			hasColorSpace: hasSetup && first.some((part) => isWord(part, 'in')),
			colorSpaceInsert: hasSetup
				? { at: setupEnd, text: ' in srgb' }
				: { at: head?.sourceIndex ?? node.sourceEndIndex - 1, text: 'in srgb, ' },
			stops: (hasSetup ? args.slice(1) : args)
				.map((arg) => arg[0])
				.filter((part): part is Node => part !== undefined && startsStop(part))
		});
		return undefined;
	});
	return gradients;
}

/**
 * What swapping a translucent stop for `color-mix()` does to a gradient's blend.
 *
 * A gradient that doesn't name a color space blends in sRGB when every stop is a legacy color (hex,
 * `rgb()`, `hsl()`, `hwb()` or a name) and in OKLab as soon as one isn't. `color-mix()` isn't legacy,
 * so the swap can move every pixel between two stops of different hues. Stops of one hue, or fading
 * to `transparent`, blend the same in either space.
 *
 * - `same`: the blend doesn't change.
 * - `name-srgb`: it would change unless the gradient says `in srgb`.
 * - `unknown`: a stop comes from a token that can differ by theme, so there's no telling.
 */
export function colorMixSwap(
	gradient: Gradient,
	primitives: Map<string, Rgba>
): 'same' | 'name-srgb' | 'unknown' {
	if (gradient.hasColorSpace) return 'same';
	const stops = gradient.stops.map((stop) => classify(stop, primitives));
	if (stops.some((stop) => stop?.legacy === false)) return 'same';
	if (stops.some((stop) => stop === undefined)) return 'unknown';
	const hues = stops.flatMap((stop) => (stop?.legacy && stop.hue !== 'none' ? [stop.hue] : []));
	const [hue] = hues;
	const oneHue = hues.every(
		(other) => hue && other && sameColor({ ...other, a: 1 }, { ...hue, a: 1 })
	);
	return oneHue ? 'same' : 'name-srgb';
}

/** A stop's `hue` is undefined for a legacy color this module can't parse, and `none` for no color. */
type Stop = { legacy: false } | { legacy: true; hue: Rgba | undefined | 'none' };

function classify(node: Node, primitives: Map<string, Rgba>): Stop | undefined {
	if (node.type === 'word') {
		const word = node.value.toLowerCase();
		if (word === 'transparent') return { legacy: true, hue: 'none' };
		const color = parseColor(word);
		if (!color) return undefined;
		return { legacy: true, hue: color.a === 0 ? 'none' : color };
	}
	if (node.type !== 'function') return undefined;
	const name = node.value.toLowerCase();
	if (MODERN_FUNCTIONS.has(name)) return { legacy: false };
	if (LEGACY_FUNCTIONS.has(name)) {
		// Relative color syntax, `rgb(from …)`, isn't legacy.
		if (node.nodes.some((part) => isWord(part, 'from'))) return { legacy: false };
		const color = parseColor(valueParser.stringify(node));
		return { legacy: true, hue: color?.a === 0 ? 'none' : color };
	}
	if (name === 'var') {
		// Primitives are hex, so they're legacy. Anything else can change with the theme.
		const color = primitives.get(node.nodes[0]?.value ?? '');
		return color ? { legacy: true, hue: color } : undefined;
	}
	return undefined;
}

function startsStop(node: Node): boolean {
	if (node.type === 'function') {
		const name = node.value.toLowerCase();
		return (
			LEGACY_FUNCTIONS.has(name) ||
			MODERN_FUNCTIONS.has(name) ||
			name === 'var' ||
			name === 'light-dark'
		);
	}
	if (node.type !== 'word') return false;
	const word = node.value.toLowerCase();
	return word === 'transparent' || word === 'currentcolor' || parseColor(word) !== undefined;
}

/** Splits a function's arguments at top-level commas, dropping spaces and comments. */
function splitArguments(nodes: Node[]): Node[][] {
	const args: Node[][] = [[]];
	for (const node of nodes) {
		if (node.type === 'div' && node.value === ',') args.push([]);
		else if (node.type !== 'space' && node.type !== 'comment') args.at(-1)!.push(node);
	}
	return args;
}

function isWord(node: Node, value: string): boolean {
	return node.type === 'word' && node.value.toLowerCase() === value;
}
