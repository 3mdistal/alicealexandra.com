import type { Rule } from 'eslint';
import type { AST, StyleContext } from 'svelte-eslint-parser';
import type { StyleDeclaration, StyleSource, StyleVisitor } from '../style-source.ts';

type CallExpression = Extract<Rule.Node, { type: 'CallExpression' }>;

const CUSTOM_PROPERTY_IN_STYLE_ATTRIBUTE = /(--[\w-]+)\s*:/g;

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
			for (const part of attribute.value) {
				if (part.type !== 'SvelteLiteral') continue;
				for (const [, name] of part.value.matchAll(CUSTOM_PROPERTY_IN_STYLE_ATTRIBUTE)) {
					if (name) localDefinitions.add(name);
				}
			}
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
					valueStart: start + declaration.prop.length + (raws.between ?? ':').length
				});
			});

			check({ declarations, localDefinitions });
		}
	};
}
