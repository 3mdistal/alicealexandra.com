const MAX_FAMILY_SIZE = 12;
const MAX_SUGGESTIONS = 3;

/**
 * Builds the "use this instead" half of a message for an unknown custom property.
 *
 * A name from a scale (`--font-size-md`) lists the whole scale, so the reader can pick a step.
 * Anything else gets up to three names that share words with it (`--accentColor` → `--color-accent`)
 * or are a typo away.
 */
export function suggestTokens(name: string, known: Iterable<string>): string {
	const names = [...new Set(known)];

	const family = name.slice(0, name.lastIndexOf('-') + 1);
	if (family.length > '--'.length) {
		const steps = names
			.filter((other) => other.startsWith(family) && !other.slice(family.length).includes('-'))
			.map((other) => other.slice(family.length));
		if (steps.length >= 2 && steps.length <= MAX_FAMILY_SIZE) {
			return `Defined \`${family}*\` tokens: ${steps.join(', ')}.`;
		}
	}

	const words = wordsOf(name);
	const closest = names
		.map((other) => ({
			other,
			shared: wordsOf(other).filter((word) => words.includes(word)).length,
			distance: editDistance(name, other)
		}))
		.filter(({ shared, distance }) => shared > 0 || distance <= 2)
		.sort((a, b) => b.shared - a.shared || a.distance - b.distance)
		.slice(0, MAX_SUGGESTIONS)
		.map(({ other }) => `\`${other}\``);

	return closest.length > 0 ? `Did you mean ${listOf(closest)}?` : '';
}

/** `a`, `a or b`, `a, b, or c` */
function listOf(items: string[]): string {
	if (items.length <= 2) return items.join(' or ');
	return `${items.slice(0, -1).join(', ')}, or ${items.at(-1)}`;
}

/** `--accentColor` and `--color-accent` both become `['accent', 'color']` in some order. */
function wordsOf(name: string): string[] {
	return name
		.replace(/^--/, '')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
		.split('-')
		.filter(Boolean);
}

function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i += 1) {
		const current = [i];
		for (let j = 1; j <= b.length; j += 1) {
			const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
			current.push(Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution));
		}
		previous = current;
	}
	return previous[b.length] ?? 0;
}
