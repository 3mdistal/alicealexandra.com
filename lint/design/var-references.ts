import valueParser from 'postcss-value-parser';

/** A `var(--name)` call found in a CSS value. */
export interface VarReference {
	name: string;
	/** `var(--x, …)` has a fallback, which marks `--x` as an input a parent may set. */
	hasFallback: boolean;
	/** Offsets of the whole `var(…)` call within the value. */
	start: number;
	end: number;
}

/** Finds every `var()` in a value, including ones nested in `calc()` or in another `var()`'s fallback. */
export function findVarReferences(value: string): VarReference[] {
	const references: VarReference[] = [];
	valueParser(value).walk((node) => {
		if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
		const first = node.nodes.find((child) => child.type !== 'comment' && child.type !== 'space');
		if (first?.type !== 'word' || !first.value.startsWith('--')) return;
		references.push({
			name: first.value,
			hasFallback: node.nodes.some((child) => child.type === 'div' && child.value === ','),
			start: node.sourceIndex,
			end: node.sourceEndIndex
		});
	});
	return references;
}
