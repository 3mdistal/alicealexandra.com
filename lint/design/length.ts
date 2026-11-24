import valueParser from 'postcss-value-parser';

/** A CSS length, such as `1rem` as `{ number: 1, unit: 'rem' }`. */
export interface Length {
	number: number;
	unit: string;
}

/** A length written out literally in a CSS value, such as `1rem` or `-3px`. */
export interface RawLength {
	text: string;
	length: Length;
	/** Offsets within the value. */
	start: number;
	end: number;
}

/** The design tokens for one kind of length, and the properties that use it. */
export interface LengthScale {
	/** What one of its lengths is called in a message. */
	noun: string;
	/** How a message about the scale begins. */
	subject: string;
	/** What the names of the scale's primitives start with. */
	prefix: string;
	/** Role tokens for the scale have one of these words in their names. */
	role: RegExp;
	property: RegExp;
}

const SCALES: LengthScale[] = [
	{
		noun: 'spacing',
		subject: 'Spacing comes',
		prefix: '--space-',
		role: /space|padding|margin|gap|gutter/,
		property:
			/^((margin|padding)(-(top|right|bottom|left|(inline|block)(-(start|end))?))?|(grid-)?((row|column)-)?gap)$/
	},
	{
		noun: 'a font size',
		subject: 'Font sizes come',
		prefix: '--font-size-',
		role: /font-size/,
		property: /^font(-size)?$/
	},
	{
		noun: 'a corner radius',
		subject: 'Corner radii come',
		prefix: '--radius-',
		role: /radius/,
		property: /^border(-(top|bottom)-(left|right)|-(start|end)-(start|end))?-radius$/
	}
];

export const MATH_FUNCTIONS = new Set([
	...['calc', 'clamp', 'min', 'max', 'round', 'mod', 'rem', 'abs', 'sign'],
	...['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'pow', 'sqrt', 'hypot', 'log', 'exp']
]);

const LENGTH =
	/^([-+]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[-+]?\d+)?)(px|r?em|r?ex|r?ch|r?cap|r?ic|r?lh|[sld]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max)|cm|mm|q|in|pt|pc)$/;

/** Units every browser has known for years, so none drops a value for using them. */
const OLD_UNIT = /^(px|r?em|ex|ch|v(w|h|min|max)|cm|mm|q|in|pt|pc)$/;

/** Units that follow the size of the window or container, such as `vw`. */
const FLUID_UNIT = /^([sld]?v|cq)(w|h|i|b|min|max)$/;

/** The size of `1rem` until a reader changes their browser's text size. */
const DEFAULT_TEXT_SIZE = 16;

/** The scale a property's lengths come from, or undefined for a property without one. */
export function scaleFor(property: string): LengthScale | undefined {
	return SCALES.find((scale) => scale.property.test(property.toLowerCase()));
}

export function parseLength(text: string): Length | undefined {
	const [, number, unit] = LENGTH.exec(text.trim().toLowerCase()) ?? [];
	return unit ? { number: Number(number), unit } : undefined;
}

/**
 * Finds every literal length in a declaration's value, including in math and in a `var()` fallback.
 * Zero isn't a design value, and neither is a viewport or container unit inside math, where it's the
 * fluid part of the formula. Pass the property so the line height in `font` isn't read as a size.
 */
export function findRawLengths(value: string, property = ''): RawLength[] {
	const isFont = property.toLowerCase() === 'font';
	const lengths: RawLength[] = [];
	const collect = (nodes: valueParser.Node[], inMath: boolean) => {
		for (const node of nodes) {
			if (isFont && !inMath && node.type === 'div' && node.value === '/') return;
			if (node.type === 'function') {
				const name = node.value.toLowerCase();
				if (name !== 'url') collect(node.nodes, inMath || MATH_FUNCTIONS.has(name));
				continue;
			}
			if (node.type !== 'word') continue;
			// The parser can leave `2*1rem` in one word.
			for (const { 0: text, index } of node.value.matchAll(/[^*/]+/g)) {
				const length = parseLength(text);
				if (!length || length.number === 0) continue;
				if (inMath && FLUID_UNIT.test(length.unit)) continue;
				const start = node.sourceIndex + index;
				lengths.push({ text, length, start, end: start + text.length });
			}
		}
	};

	collect(valueParser(value).nodes, false);
	return lengths;
}

/**
 * True when putting a `var()` in a value can't change which declaration a browser uses. A browser that
 * can't parse a value, such as one in `dvh`, drops it and uses the declaration before it. It can't tell
 * until too late once the value has a `var()`, so a value with a function or a newer unit shouldn't get
 * its first one.
 */
export function canTakeVar(value: string): boolean {
	let hasVar = false;
	let mayNotParse = false;
	valueParser(value).walk((node) => {
		if (node.type === 'function') {
			if (node.value.toLowerCase() === 'var') hasVar = true;
			else mayNotParse = true;
		} else if (node.type === 'word') {
			const unit = parseLength(node.value)?.unit;
			mayNotParse ||= unit !== undefined && !OLD_UNIT.test(unit);
		}
	});
	return hasVar || !mayNotParse;
}

/** True when two lengths are the same everywhere: the same number in the same unit. */
export function sameLength(x: Length, y: Length): boolean {
	return x.unit === y.unit && x.number === y.number;
}

/**
 * A length in pixels at the browser's default text size, or undefined for a unit that follows
 * something else, such as `em` or `vw`.
 */
export function defaultPixels({ number, unit }: Length): number | undefined {
	if (unit === 'px') return number;
	if (unit === 'rem') return number * DEFAULT_TEXT_SIZE;
	return undefined;
}
