import type { Rule } from 'eslint';
import { designSettings, samePath } from '../settings.ts';
import { visitStyles } from '../style-source.ts';
import { suggestInsteadOfPrimitive } from '../suggest.ts';
import { loadTokenManifest, primitivesIn } from '../token-manifest.ts';
import { findVarReferences } from '../var-references.ts';

/**
 * Components use role colors, not palette primitives. A primitive such as `--color-olive-800` has
 * one value everywhere, so text or a surface colored with it stays the same in dark mode and on
 * every route theme. The News changelog toggle was olive-800 on the dark page at 1.25:1, and the
 * contrast test couldn't see it, because it checks only role-token pairs.
 *
 * Colors that mustn't follow the theme, such as text and scrims over a photo, use the fixed roles
 * (`--color-fixed-*`), so the choice is named. A declaration inside a `prefers-color-scheme` query
 * may use a primitive, since it's already written for one color scheme.
 *
 * There's no automatic fix: a role changes with the theme, so swapping one in can change pixels.
 */
const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require components and stylesheets to use role colors, not palette primitives'
		},
		messages: {
			primitiveColor:
				'`{{name}}` is a palette color, so it stays the same in dark mode and on every route theme. {{suggestion}}'
		},
		schema: []
	},

	create(context) {
		const { tokenFiles, primitivesFile } = designSettings(context);
		if (!primitivesFile) {
			throw new Error(
				'design/no-primitive-color needs `settings.design.primitivesFile` in eslint.config.js.'
			);
		}
		if (tokenFiles.some((file) => samePath(file, context.filename))) return {};

		const { definitions } = loadTokenManifest(tokenFiles);
		const primitives = primitivesIn(definitions, primitivesFile);
		const primitiveNames = new Set(primitives.all);
		const colorPrimitives = new Set(primitives.colors.map(({ name }) => name));
		const { sourceCode } = context;

		return visitStyles(context, ({ declarations }) => {
			for (const { property, value, valueStart, context: around } of declarations) {
				if (around.some((wrapper) => /^@media\b.*\bprefers-color-scheme\b/i.test(wrapper))) {
					continue;
				}
				for (const reference of findVarReferences(value)) {
					if (!colorPrimitives.has(reference.name)) continue;
					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(valueStart + reference.start),
							end: sourceCode.getLocFromIndex(valueStart + reference.end)
						},
						messageId: 'primitiveColor',
						data: {
							name: reference.name,
							suggestion: suggestInsteadOfPrimitive(
								reference.name,
								property.toLowerCase(),
								definitions,
								(name) => primitiveNames.has(name)
							)
						}
					});
				}
			}
		});
	}
};

export default rule;
