import type { Rule } from 'eslint';
import { canTakeVar, findRawLengths, scaleFor } from '../length.ts';
import { designSettings, samePath } from '../settings.ts';
import { visitStyles } from '../style-source.ts';
import { matchLength, suggestLength } from '../suggest.ts';
import { loadTokenManifest, primitivesIn } from '../token-manifest.ts';

/**
 * Margins, paddings, gaps, font sizes and corner radii come from the design tokens. A raw length such
 * as `13px` in a `.svelte` style block or a stylesheet is reported, including inside math and a `var()`
 * fallback, so each scale stays in one place. A custom property may hold a raw length, which names it,
 * and so may a keyframe. The token files themselves are left to `design/token-tiers`.
 *
 * A length equal to a primitive on the property's own scale is fixed automatically, since a primitive
 * has the same value everywhere. The fix is skipped where the value's first `var()` would stop an older
 * browser from falling back to an earlier declaration. Everything else is only suggested: `16px` stops
 * being `1rem` when a reader changes their text size, a negative length needs math, and a role token can
 * change.
 */
const NO_FALLBACK_NOTE =
	" It isn't fixed automatically, because a browser that can't read the rest of this value uses an earlier declaration instead, and wouldn't once the value has a `var()`.";

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		fixable: 'code',
		docs: {
			description:
				'Require spacing, font sizes and corner radii in components and stylesheets to come from the design tokens'
		},
		messages: {
			rawLength:
				'`{{text}}` is {{noun}} written by hand. {{subject}} from the design tokens, so each scale stays in one place. {{suggestion}}'
		},
		schema: []
	},

	create(context) {
		const { tokenFiles, primitivesFile } = designSettings(context);
		if (!primitivesFile) {
			throw new Error(
				'design/no-raw-length needs `settings.design.primitivesFile` in eslint.config.js.'
			);
		}
		if (tokenFiles.some((file) => samePath(file, context.filename))) return {};

		const { definitions } = loadTokenManifest(tokenFiles);
		const primitives = primitivesIn(definitions, primitivesFile);
		const primitiveNames = new Set(primitives.all);
		const { sourceCode } = context;

		return visitStyles(context, ({ declarations }) => {
			for (const { property, value, valueStart, context: around } of declarations) {
				const scale = scaleFor(property);
				if (!scale || around.some((wrapper) => /^@(-\w+-)?keyframes\b/i.test(wrapper))) continue;
				const steps = primitives.lengths.filter(({ name }) => name.startsWith(scale.prefix));
				const fixable = canTakeVar(value);
				for (const { text, length, start, end } of findRawLengths(value, property)) {
					const range: [number, number] = [valueStart + start, valueStart + end];
					const match = matchLength(length, steps);
					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(range[0]),
							end: sourceCode.getLocFromIndex(range[1])
						},
						messageId: 'rawLength',
						data: {
							text,
							noun: scale.noun,
							subject: scale.subject,
							suggestion:
								suggestLength(length, scale, steps, definitions, (name) =>
									primitiveNames.has(name)
								) + (match && !fixable ? NO_FALLBACK_NOTE : '')
						},
						fix:
							match && fixable
								? (fixer) => fixer.replaceTextRange(range, `var(${match.name})`)
								: null
					});
				}
			}
		});
	}
};

export default rule;
