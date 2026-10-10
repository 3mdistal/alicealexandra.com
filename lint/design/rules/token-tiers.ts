import type { Rule } from 'eslint';
import { basename } from 'node:path';
import valueParser from 'postcss-value-parser';
import { findRawColors, parseColor } from '../color.ts';
import { designSettings, samePath } from '../settings.ts';
import { visitStyles } from '../style-source.ts';
import { suggestColor, type ColorPrimitive } from '../suggest.ts';
import { loadTokenManifest } from '../token-manifest.ts';

/** Functions whose result depends on other tokens, math, the color scheme or the environment. */
const NOT_RAW_FUNCTIONS = new Set([
	'var',
	'env',
	'attr',
	'light-dark',
	'color-mix',
	...['calc', 'clamp', 'min', 'max', 'round', 'mod', 'rem', 'abs', 'sign'],
	...['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'pow', 'sqrt', 'hypot', 'log', 'exp']
]);

/**
 * The token files come in two tiers. Primitives (`settings.design.primitivesFile`) are raw values,
 * each defined once on the top-level `:root`, so a primitive means the same thing on every route,
 * in both color schemes and at every width. Role tokens, in the other token files, reference
 * primitives and change by route, color scheme and breakpoint. Keeping the tiers apart means a
 * component can trust that `--color-sky-500` is always the same blue, and that a theme's colors
 * all come from one palette.
 *
 * Role files can't hold raw colors yet; raw lengths, durations and shadows join as their rules land.
 */
const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Keep raw values in the primitives file and references in the role token files'
		},
		messages: {
			rawColor:
				'`{{text}}` is a raw color in a role token file. Role tokens reference primitives from {{primitives}}, so every color comes from one palette. {{suggestion}}',
			redefinedPrimitive:
				"`{{name}}` is a primitive, so it keeps one value everywhere and a role token file can't redefine it. Define a role token here instead, and point it at a primitive with `var()`.",
			notOnRoot:
				'`{{name}}` is defined inside `{{where}}`. A primitive has one value everywhere, so define it only on the top-level `:root`, and put themed or responsive values in a role token file.',
			notAToken:
				"`{{name}}` isn't a custom property. {{primitives}} only defines primitives; put styles in a role token file or a component.",
			notRaw:
				'`{{name}}` is built from `{{part}}`. Primitives are raw values; a token that depends on other tokens, math, the color scheme or the environment is a role token, so define it in a role token file.',
			duplicate: '`{{name}}` is already defined on line {{line}}. Define each primitive once.'
		},
		schema: []
	},

	create(context) {
		const { tokenFiles, primitivesFile } = designSettings(context);
		if (!primitivesFile) {
			throw new Error(
				'design/token-tiers needs `settings.design.primitivesFile` in eslint.config.js.'
			);
		}
		if (!tokenFiles.some((file) => samePath(file, context.filename))) return {};

		const { sourceCode } = context;
		const locOf = (start: number, end: number) => ({
			start: sourceCode.getLocFromIndex(start),
			end: sourceCode.getLocFromIndex(end)
		});
		const primitivesName = basename(primitivesFile);

		if (samePath(context.filename, primitivesFile)) {
			return visitStyles(context, ({ declarations }) => {
				const firstLines = new Map<string, number>();
				for (const { property: name, value, start, context: where } of declarations) {
					const loc = locOf(start, start + name.length);
					if (!name.startsWith('--')) {
						context.report({
							loc,
							messageId: 'notAToken',
							data: { name, primitives: primitivesName }
						});
						continue;
					}
					const part = nonRawPart(value);
					if (part) context.report({ loc, messageId: 'notRaw', data: { name, part } });
					if (where.length !== 1 || where[0]?.toLowerCase() !== ':root') {
						context.report({ loc, messageId: 'notOnRoot', data: { name, where: where.join(' ') } });
						continue;
					}
					const firstLine = firstLines.get(name);
					if (firstLine) {
						context.report({
							loc,
							messageId: 'duplicate',
							data: { name, line: String(firstLine) }
						});
					} else {
						firstLines.set(name, loc.start.line);
					}
				}
			});
		}

		const primitives = primitivesIn(loadTokenManifest(tokenFiles).definitions, primitivesFile);
		const primitiveNames = new Set(primitives.all);
		return visitStyles(context, ({ declarations }) => {
			for (const { property, value, start, valueStart } of declarations) {
				if (primitiveNames.has(property)) {
					context.report({
						loc: locOf(start, start + property.length),
						messageId: 'redefinedPrimitive',
						data: { name: property }
					});
				}
				for (const color of findRawColors(value, property)) {
					context.report({
						loc: locOf(valueStart + color.start, valueStart + color.end),
						messageId: 'rawColor',
						data: {
							text: color.text,
							primitives: primitivesName,
							suggestion: suggestColor(color.color, primitives.colors)
						}
					});
				}
			}
		});
	}
};

/** The first function in a value that keeps it from being raw, such as `var()`, or undefined. */
function nonRawPart(value: string): string | undefined {
	let part: string | undefined;
	valueParser(value).walk((node) => {
		if (part || node.type !== 'function') return;
		const name = node.value.toLowerCase();
		if (NOT_RAW_FUNCTIONS.has(name)) part = `${name}()`;
	});
	return part;
}

function primitivesIn(
	definitions: ReturnType<typeof loadTokenManifest>['definitions'],
	primitivesFile: string
): { all: string[]; colors: ColorPrimitive[] } {
	const all: string[] = [];
	const colors: ColorPrimitive[] = [];
	for (const [name, list] of definitions) {
		const primitive = list.find((definition) => samePath(definition.file, primitivesFile));
		if (!primitive) continue;
		all.push(name);
		const color = parseColor(primitive.value);
		if (color) colors.push({ name, color });
	}
	return { all, colors };
}

export default rule;
