import type { Rule } from 'eslint';
import postcss from 'postcss';
import type { AST, StyleContext } from 'svelte-eslint-parser';
import type { StyleDeclaration, StyleSource, StyleVisitor } from '../style-source.ts';
import { contextOf } from '../token-manifest.ts';

type CallExpression = Extract<Rule.Node, { type: 'CallExpression' }>;

/**
 * Reads a `.svelte` file's `<style>` block, plus the custom properties its markup and script set:
 * `style="--x: …"`, `style:--x={…}`, and `element.style.setProperty('--x', …)`.
 */
export function svelteStyleVisitor(
	context: Rule.RuleContext,
	check: (source: StyleSource) => void
): StyleVisitor {
	const localDefinitions = new Set<string>();

	return {
		SvelteAttribute(node) {
			const attribute = node as AST.SvelteAttribute;
			if (attribute.key.name !== 'style') return;
			for (const name of customPropertiesIn(attribute)) localDefinitions.add(name);
		},
		SvelteStyleDirective(node) {
			const { name } = (node as AST.SvelteStyleDirective).key;
			if (name.type === 'SvelteName' && name.name.startsWith('--')) localDefinitions.add(name.name);
		},
		CallExpression(node) {
			const { callee, arguments: args } = node as CallExpression;
			const [first] = args;
			if (
				callee.type === 'MemberExpression' &&
				callee.property.type === 'Identifier' &&
				callee.property.name === 'setProperty' &&
				callee.object.type === 'MemberExpression' &&
				callee.object.property.type === 'Identifier' &&
				callee.object.property.name === 'style' &&
				first?.type === 'Literal' &&
				typeof first.value === 'string' &&
				first.value.startsWith('--')
			) {
				localDefinitions.add(first.value);
			}
		},
		'Program:exit'() {
			const getStyleContext = context.sourceCode.parserServices?.['getStyleContext'] as
				(() => StyleContext) | undefined;
			const style = getStyleContext?.();
			if (style?.status !== 'success') return;

			const declarations: StyleDeclaration[] = [];
			style.sourceAst.walkDecls((declaration) => {
				const start = declaration.source?.start?.offset;
				if (start === undefined) return;
				if (declaration.prop.startsWith('--')) localDefinitions.add(declaration.prop);
				const raws = declaration.raws as { between?: string; value?: { raw: string } };
				declarations.push({
					property: declaration.prop,
					value: raws.value?.raw ?? declaration.value,
					start,
					valueStart: start + declaration.prop.length + (raws.between ?? ':').length,
					context: contextOf(declaration)
				});
			});

			check({ declarations, localDefinitions });
		}
	};
}

/**
 * The custom properties a `style="…"` attribute sets. Each `{expression}` becomes an empty comment,
 * which fits both in a value (`--delay: {i * 0.1}s`) and where a whole declaration would go.
 */
function customPropertiesIn(attribute: AST.SvelteAttribute): string[] {
	const text = attribute.value
		.map((part) => (part.type === 'SvelteLiteral' ? part.value : '/**/'))
		.join('');
	try {
		const names: string[] = [];
		postcss.parse(`a{${text}}`).walkDecls((declaration) => {
			if (declaration.prop.startsWith('--')) names.push(declaration.prop);
		});
		return names;
	} catch {
		return [];
	}
}
