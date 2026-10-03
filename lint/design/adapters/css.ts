import type { Rule } from 'eslint';
import type { StyleDeclaration, StyleSource, StyleVisitor } from '../style-source.ts';

interface Located {
	loc: { start: { offset: number }; end: { offset: number } };
}

/** The parts of CSSTree nodes (from `@eslint/css`) this adapter reads. */
interface CssDeclarationNode extends Located {
	property: string;
	value: Partial<Located>;
}

interface CssRuleNode {
	prelude: Partial<Located>;
}

interface CssAtruleNode {
	name: string;
	prelude: Partial<Located> | null;
}

/** Reads declarations from a `.css` file parsed by `@eslint/css`. */
export function cssStyleVisitor(
	context: Rule.RuleContext,
	check: (source: StyleSource) => void
): StyleVisitor {
	const { text } = context.sourceCode;
	const declarations: StyleDeclaration[] = [];
	const localDefinitions = new Set<string>();
	// The selectors and at-rules the walk is inside, written the way PostCSS reports them.
	const enclosing: string[] = [];
	const textOf = (node: Partial<Located> | null) =>
		node?.loc ? text.slice(node.loc.start.offset, node.loc.end.offset).trim() : '';

	return {
		Rule(node) {
			enclosing.push(textOf((node as CssRuleNode).prelude));
		},
		'Rule:exit'() {
			enclosing.pop();
		},
		Atrule(node) {
			const { name, prelude } = node as CssAtruleNode;
			enclosing.push(`@${name} ${textOf(prelude)}`);
		},
		'Atrule:exit'() {
			enclosing.pop();
		},
		Declaration(node) {
			const { property, value, loc } = node as CssDeclarationNode;
			if (property.startsWith('--')) localDefinitions.add(property);
			if (!value.loc) return;
			const { start, end } = value.loc;
			declarations.push({
				property,
				value: text.slice(start.offset, end.offset),
				start: loc.start.offset,
				valueStart: start.offset,
				context: [...enclosing]
			});
		},
		'StyleSheet:exit'() {
			check({ declarations, localDefinitions });
		}
	};
}
