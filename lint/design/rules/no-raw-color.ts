import type { Rule } from 'eslint';
import { findRawColors } from '../color.ts';
import { colorMixSwap, findGradients } from '../gradient.ts';
import { designSettings, samePath } from '../settings.ts';
import { visitStyles } from '../style-source.ts';
import { matchColor, suggestColor, suggestRoles } from '../suggest.ts';
import { loadTokenManifest, primitivesIn } from '../token-manifest.ts';

/**
 * Colors come from the design tokens. A raw `#hex`, `rgb()`, `hsl()` or named color in a `.svelte`
 * style block or a stylesheet is an error, including inside a `var()` fallback, so the palette
 * stays in one place. The token files themselves are checked by `design/token-tiers`.
 *
 * A color that matches a primitive is fixed automatically, since a primitive has the same value
 * everywhere: `var()` for an opaque color, `color-mix()` for a translucent one. Both render the same,
 * except that the browser rounds a `color-mix()` gradient stop differently, by one level out of 255
 * at most. A `color-mix()` stop can also change the color space a gradient blends in, so there the fix
 * adds `in srgb`, or is skipped when the other stops are tokens it can't resolve.
 *
 * Role tokens follow the route theme and color scheme, so the message only suggests them.
 */
const GRADIENT_NOTES = {
	same: '',
	'name-srgb':
		' In this gradient, a `color-mix()` stop would switch blending from sRGB to OKLab and shift the colors between stops, so the fix also adds `in srgb`.',
	unknown:
		" In a gradient, a `color-mix()` stop switches blending from sRGB to OKLab, which shifts the colors between stops of different hues. This gradient's other stops are tokens that can change with the theme, so it isn't fixed automatically. If every stop resolves to a hex, `rgb()`, `hsl()` or named color, add `in srgb` as well."
};

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		fixable: 'code',
		docs: {
			description: 'Require colors in components and stylesheets to come from the design tokens'
		},
		messages: {
			rawColor:
				'`{{text}}` is a raw color. Colors come from the design tokens, so the palette stays in one place. {{suggestion}}'
		},
		schema: []
	},

	create(context) {
		const { tokenFiles, primitivesFile } = designSettings(context);
		if (!primitivesFile) {
			throw new Error(
				'design/no-raw-color needs `settings.design.primitivesFile` in eslint.config.js.'
			);
		}
		if (tokenFiles.some((file) => samePath(file, context.filename))) return {};

		const { definitions } = loadTokenManifest(tokenFiles);
		const primitives = primitivesIn(definitions, primitivesFile);
		const primitiveNames = new Set(primitives.all);
		const primitiveColors = new Map(primitives.colors.map(({ name, color }) => [name, color]));
		const { sourceCode } = context;

		return visitStyles(context, ({ declarations }) => {
			for (const { property, value, valueStart } of declarations) {
				const gradients = findGradients(value);
				for (const color of findRawColors(value, property)) {
					const range: [number, number] = [valueStart + color.start, valueStart + color.end];
					const match = matchColor(color.color, primitives.colors);
					const roles =
						match?.primitive && match.replacement.startsWith('var(')
							? suggestRoles(match.primitive.name, property, definitions, (name) =>
									primitiveNames.has(name)
								)
							: '';
					const gradient = match?.replacement.startsWith('color-mix(')
						? gradients.find(({ start, end }) => start <= color.start && color.end <= end)
						: undefined;
					const swap = gradient ? colorMixSwap(gradient, primitiveColors) : 'same';
					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(range[0]),
							end: sourceCode.getLocFromIndex(range[1])
						},
						messageId: 'rawColor',
						data: {
							text: color.text,
							suggestion:
								suggestColor(color.color, primitives.colors) + roles + GRADIENT_NOTES[swap]
						},
						fix:
							!match || swap === 'unknown'
								? null
								: (fixer) => {
										const replace = fixer.replaceTextRange(range, match.replacement);
										if (!gradient || swap === 'same') return replace;
										const { at, text } = gradient.colorSpaceInsert;
										return [
											fixer.insertTextAfterRange([valueStart + at, valueStart + at], text),
											replace
										];
									}
					});
				}
			}
		});
	}
};

export default rule;
