import valueParser from 'postcss-value-parser';

/** An sRGB color with 0–255 channels and 0–1 alpha. */
export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

/** A color written out literally in a CSS value, such as `#fff`, `rgba(0, 0, 0, 0.5)` or `white`. */
export interface RawColor {
	text: string;
	/** The parsed color, or undefined for spaces this module doesn't convert, like `oklch()`. */
	color: Rgba | undefined;
	/** Offsets within the value. */
	start: number;
	end: number;
}

const COLOR_FUNCTIONS = new Set([
	'rgb',
	'rgba',
	'hsl',
	'hsla',
	'hwb',
	'lab',
	'lch',
	'oklab',
	'oklch',
	'color'
]);

/**
 * Properties whose words are names, not colors, so `animation-name: orange` or `grid-area: tan` isn't
 * a color.
 */
const NAME_PROPERTIES = new Set([
	'animation',
	'animation-name',
	'animation-timeline',
	'anchor-name',
	'container',
	'container-name',
	'counter-increment',
	'counter-reset',
	'counter-set',
	'font',
	'font-family',
	'grid-area',
	'grid-column',
	'grid-column-end',
	'grid-column-start',
	'grid-row',
	'grid-row-end',
	'grid-row-start',
	'grid-template',
	'grid-template-areas',
	'list-style-type',
	'page',
	'position-anchor',
	'scroll-timeline-name',
	'timeline-scope',
	'transition',
	'transition-property',
	'view-timeline-name',
	'view-transition-name',
	'will-change'
]);

/** Colors the browser picks from the user's system theme, such as `Canvas`; they have no fixed value. */
const SYSTEM_COLORS = new Set(
	[
		'AccentColor',
		'AccentColorText',
		'ActiveText',
		'ButtonBorder',
		'ButtonFace',
		'ButtonText',
		'Canvas',
		'CanvasText',
		'Field',
		'FieldText',
		'GrayText',
		'Highlight',
		'HighlightText',
		'LinkText',
		'Mark',
		'MarkText',
		'SelectedItem',
		'SelectedItemText',
		'VisitedText'
	].map((name) => name.toLowerCase())
);

/**
 * Finds every literal color in a declaration's value, skipping keywords like `transparent` and
 * `currentColor`. Pass the property so names in properties like `animation-name` aren't read as colors.
 */
export function findRawColors(value: string, property = ''): RawColor[] {
	const namesAreColors = !NAME_PROPERTIES.has(property.toLowerCase());
	const colors: RawColor[] = [];
	valueParser(value).walk((node) => {
		if (node.type === 'function') {
			if (node.value.toLowerCase() === 'url') return false;
			if (!COLOR_FUNCTIONS.has(node.value.toLowerCase())) return undefined;
			const text = valueParser.stringify(node);
			colors.push({
				text,
				color: parseColor(text),
				start: node.sourceIndex,
				end: node.sourceEndIndex
			});
			return false;
		}
		if (node.type !== 'word') return undefined;
		const word = node.value.toLowerCase();
		const isColor =
			(word.startsWith('#') && parseColor(word)) ||
			(namesAreColors && (NAMED_COLORS.has(word) || SYSTEM_COLORS.has(word)));
		if (isColor) {
			colors.push({
				text: node.value,
				color: parseColor(word),
				start: node.sourceIndex,
				end: node.sourceEndIndex
			});
		}
		return undefined;
	});
	return colors;
}

/** Parses hex, `rgb()`, `rgba()`, `hsl()`, `hsla()` and named colors. */
export function parseColor(text: string): Rgba | undefined {
	const value = text.trim().toLowerCase();

	const named = NAMED_COLORS.get(value);
	if (named) return parseColor(named);

	const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value)?.[1];
	if (hex) {
		const digits = hex.length <= 4 ? [...hex].map((digit) => digit + digit) : hex.match(/../g)!;
		const [r = 0, g = 0, b = 0, a = 255] = digits.map((pair) => parseInt(pair, 16));
		return { r, g, b, a: a / 255 };
	}

	const call = /^(rgba?|hsla?)\((.*)\)$/.exec(value);
	if (!call) return undefined;
	const [, name = '', body = ''] = call;
	const parts = body
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map((part) => /^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)([a-z%]*)$/.exec(part))
		.map((match) => match && { number: Number(match[1]), unit: match[2] ?? '' });
	if (parts.length < 3 || parts.length > 4 || parts.some((part) => !part)) return undefined;
	const [first, second, third, fourth] = parts as [Part, Part, Part, Part | undefined];
	const a = clamp(fourth ? (fourth.unit === '%' ? fourth.number / 100 : fourth.number) : 1, 0, 1);

	if (name.startsWith('rgb')) {
		const channel = ({ number, unit }: Part) =>
			clamp(unit === '%' ? (number * 255) / 100 : number, 0, 255);
		return { r: channel(first), g: channel(second), b: channel(third), a };
	}
	const hue = degrees(first);
	if (hue === undefined) return undefined;
	const fraction = ({ number }: Part) => clamp(number / 100, 0, 1);
	return { ...hslToRgb(hue, fraction(second), fraction(third)), a };
}

type Part = { number: number; unit: string };

const DEGREES_PER_UNIT: Record<string, number> = {
	'': 1,
	deg: 1,
	grad: 0.9,
	rad: 180 / Math.PI,
	turn: 360
};

/** A hue in degrees from 0 up to 360, or undefined for a unit that isn't an angle. */
function degrees({ number, unit }: Part): number | undefined {
	const perUnit = DEGREES_PER_UNIT[unit];
	if (perUnit === undefined) return undefined;
	return (((number * perUnit) % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
	const k = (n: number) => (n + hue / 30) % 12;
	const chroma = saturation * Math.min(lightness, 1 - lightness);
	const channel = (n: number) =>
		255 * (lightness - chroma * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
	return { r: channel(0), g: channel(8), b: channel(4) };
}

/** True when two colors render identically: same 8-bit channels and alpha. */
export function sameColor(x: Rgba, y: Rgba): boolean {
	return (
		Math.round(x.r) === Math.round(y.r) &&
		Math.round(x.g) === Math.round(y.g) &&
		Math.round(x.b) === Math.round(y.b) &&
		Math.abs(x.a - y.a) < 0.002
	);
}

/** `color-mix(in srgb, x p%, y q%)`, interpolating with premultiplied alpha as browsers do. */
export function mixColors(x: Rgba, xWeight: number, y: Rgba, yWeight: number): Rgba {
	const total = xWeight + yWeight;
	const [p, q] = [xWeight / total, yWeight / total];
	const a = x.a * p + y.a * q;
	const channel = (key: 'r' | 'g' | 'b') =>
		a === 0 ? 0 : (x[key] * x.a * p + y[key] * y.a * q) / a;
	// Weights that add up to less than 100% make the result that much more transparent.
	return { r: channel('r'), g: channel('g'), b: channel('b'), a: a * Math.min(total, 1) };
}

/** Paints a translucent color over an opaque one. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
	const channel = (key: 'r' | 'g' | 'b') => top[key] * top.a + bottom[key] * (1 - top.a);
	return { r: channel('r'), g: channel('g'), b: channel('b'), a: 1 };
}

/** How different two opaque colors look: the distance between them in OKLab, where 0.02 is barely visible. */
export function colorDistance(x: Rgba, y: Rgba): number {
	const [a, b] = [toOklab(x), toOklab(y)];
	return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function toOklab(color: Rgba): [number, number, number] {
	const [r, g, b] = [color.r, color.g, color.b].map(linearChannel) as [number, number, number];
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
}

/** WCAG 2 contrast ratio between two opaque colors, from 1 to 21. */
export function contrastRatio(x: Rgba, y: Rgba): number {
	const [lighter, darker] = [luminance(x), luminance(y)].sort((m, n) => n - m) as [number, number];
	return (lighter + 0.05) / (darker + 0.05);
}

function luminance({ r, g, b }: Rgba): number {
	return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

/** An sRGB channel from 0–255 as linear light from 0–1. */
function linearChannel(channel: number): number {
	const value = channel / 255;
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** CSS named colors, without `transparent` and `currentColor`, which aren't design values. */
const NAMED_COLORS = new Map(
	Object.entries({
		aliceblue: '#f0f8ff',
		antiquewhite: '#faebd7',
		aqua: '#00ffff',
		aquamarine: '#7fffd4',
		azure: '#f0ffff',
		beige: '#f5f5dc',
		bisque: '#ffe4c4',
		black: '#000000',
		blanchedalmond: '#ffebcd',
		blue: '#0000ff',
		blueviolet: '#8a2be2',
		brown: '#a52a2a',
		burlywood: '#deb887',
		cadetblue: '#5f9ea0',
		chartreuse: '#7fff00',
		chocolate: '#d2691e',
		coral: '#ff7f50',
		cornflowerblue: '#6495ed',
		cornsilk: '#fff8dc',
		crimson: '#dc143c',
		cyan: '#00ffff',
		darkblue: '#00008b',
		darkcyan: '#008b8b',
		darkgoldenrod: '#b8860b',
		darkgray: '#a9a9a9',
		darkgreen: '#006400',
		darkgrey: '#a9a9a9',
		darkkhaki: '#bdb76b',
		darkmagenta: '#8b008b',
		darkolivegreen: '#556b2f',
		darkorange: '#ff8c00',
		darkorchid: '#9932cc',
		darkred: '#8b0000',
		darksalmon: '#e9967a',
		darkseagreen: '#8fbc8f',
		darkslateblue: '#483d8b',
		darkslategray: '#2f4f4f',
		darkslategrey: '#2f4f4f',
		darkturquoise: '#00ced1',
		darkviolet: '#9400d3',
		deeppink: '#ff1493',
		deepskyblue: '#00bfff',
		dimgray: '#696969',
		dimgrey: '#696969',
		dodgerblue: '#1e90ff',
		firebrick: '#b22222',
		floralwhite: '#fffaf0',
		forestgreen: '#228b22',
		fuchsia: '#ff00ff',
		gainsboro: '#dcdcdc',
		ghostwhite: '#f8f8ff',
		gold: '#ffd700',
		goldenrod: '#daa520',
		gray: '#808080',
		green: '#008000',
		greenyellow: '#adff2f',
		grey: '#808080',
		honeydew: '#f0fff0',
		hotpink: '#ff69b4',
		indianred: '#cd5c5c',
		indigo: '#4b0082',
		ivory: '#fffff0',
		khaki: '#f0e68c',
		lavender: '#e6e6fa',
		lavenderblush: '#fff0f5',
		lawngreen: '#7cfc00',
		lemonchiffon: '#fffacd',
		lightblue: '#add8e6',
		lightcoral: '#f08080',
		lightcyan: '#e0ffff',
		lightgoldenrodyellow: '#fafad2',
		lightgray: '#d3d3d3',
		lightgreen: '#90ee90',
		lightgrey: '#d3d3d3',
		lightpink: '#ffb6c1',
		lightsalmon: '#ffa07a',
		lightseagreen: '#20b2aa',
		lightskyblue: '#87cefa',
		lightslategray: '#778899',
		lightslategrey: '#778899',
		lightsteelblue: '#b0c4de',
		lightyellow: '#ffffe0',
		lime: '#00ff00',
		limegreen: '#32cd32',
		linen: '#faf0e6',
		magenta: '#ff00ff',
		maroon: '#800000',
		mediumaquamarine: '#66cdaa',
		mediumblue: '#0000cd',
		mediumorchid: '#ba55d3',
		mediumpurple: '#9370db',
		mediumseagreen: '#3cb371',
		mediumslateblue: '#7b68ee',
		mediumspringgreen: '#00fa9a',
		mediumturquoise: '#48d1cc',
		mediumvioletred: '#c71585',
		midnightblue: '#191970',
		mintcream: '#f5fffa',
		mistyrose: '#ffe4e1',
		moccasin: '#ffe4b5',
		navajowhite: '#ffdead',
		navy: '#000080',
		oldlace: '#fdf5e6',
		olive: '#808000',
		olivedrab: '#6b8e23',
		orange: '#ffa500',
		orangered: '#ff4500',
		orchid: '#da70d6',
		palegoldenrod: '#eee8aa',
		palegreen: '#98fb98',
		paleturquoise: '#afeeee',
		palevioletred: '#db7093',
		papayawhip: '#ffefd5',
		peachpuff: '#ffdab9',
		peru: '#cd853f',
		pink: '#ffc0cb',
		plum: '#dda0dd',
		powderblue: '#b0e0e6',
		purple: '#800080',
		rebeccapurple: '#663399',
		red: '#ff0000',
		rosybrown: '#bc8f8f',
		royalblue: '#4169e1',
		saddlebrown: '#8b4513',
		salmon: '#fa8072',
		sandybrown: '#f4a460',
		seagreen: '#2e8b57',
		seashell: '#fff5ee',
		sienna: '#a0522d',
		silver: '#c0c0c0',
		skyblue: '#87ceeb',
		slateblue: '#6a5acd',
		slategray: '#708090',
		slategrey: '#708090',
		snow: '#fffafa',
		springgreen: '#00ff7f',
		steelblue: '#4682b4',
		tan: '#d2b48c',
		teal: '#008080',
		thistle: '#d8bfd8',
		tomato: '#ff6347',
		turquoise: '#40e0d0',
		violet: '#ee82ee',
		wheat: '#f5deb3',
		white: '#ffffff',
		whitesmoke: '#f5f5f5',
		yellow: '#ffff00',
		yellowgreen: '#9acd32'
	})
);
