import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { describe, expect, it } from 'vitest';
import {
	composite,
	contrastRatio,
	mixColors,
	parseColor,
	type Rgba
} from '../../../../lint/design/color.ts';
import type { SiteSurface, SiteTheme } from '$lib/theme/route-theme';

/**
 * WCAG AA asks for a contrast ratio of at least 4.5:1 between text and its background. This test
 * resolves the color tokens the way the browser's cascade does, for every route theme in light and
 * dark mode, and checks the text and background pairs the site's components use.
 */
const AA = 4.5;

const THEMES: SiteTheme[] = ['home', 'about', 'studio', 'career', 'blog', 'news'];
const SCHEMES = ['light', 'dark'] as const;
type Scheme = (typeof SCHEMES)[number];

/** Text tokens and the backgrounds they sit on, topmost layer first, ending on an opaque one. */
type Pair = [text: string, backgrounds: string[]];

const ROUTE_PAIRS: Pair[] = [
	// Page text; cards; pills, subtabs and hovered links on the muted surface; buttons; link hovers.
	...['--color-text', '--color-text-muted'].flatMap((text): Pair[] => [
		[text, ['--color-bg']],
		[text, ['--color-surface', '--color-bg']],
		[text, ['--color-surface-muted', '--color-bg']]
	]),
	['--color-accent', ['--color-bg']],
	['--color-accent', ['--color-surface', '--color-bg']],
	['--color-accent-strong', ['--color-bg']],
	// The navigation pill, its hovered and active links, and the mobile menu.
	['--chrome-text', ['--chrome-surface', '--color-bg']],
	['--chrome-accent', ['--chrome-bg', '--chrome-surface', '--color-bg']],
	['--chrome-accent-strong', ['--chrome-bg', '--chrome-surface', '--color-bg']],
	['--chrome-text', ['--chrome-surface', '--chrome-mobile-bg']],
	['--chrome-accent', ['--chrome-surface', '--chrome-mobile-bg']],
	['--chrome-accent-strong', ['--chrome-surface', '--chrome-mobile-bg']]
];

const HOME_PAIRS: Pair[] = ['about', 'studio', 'career', 'blog', 'news'].map((section) => [
	`--home-${section}-label`,
	[`--home-${section}-bg`]
]);

const PROSE_PAIRS: Pair[] = [
	...[
		'--color-content-bg',
		'--color-content-code-bg',
		'--color-content-callout-bg',
		'--color-content-quote-bg',
		'--color-content-inline-code-bg'
	].map((background): Pair => ['--color-content-text', [background]]),
	...[
		'--color-content-secondary',
		'--color-content-link',
		'--color-content-link-hover',
		'--color-content-heading',
		'--color-content-accent',
		'--color-content-mention',
		'--color-content-equation'
	].map((text): Pair => [text, ['--color-content-bg']])
];

/**
 * Pairs below AA today, awaiting Alice's decision: approve the exception, or change the colors and
 * delete the entry. The ratios are pinned so a change that makes one worse also fails.
 */
const EXCEPTIONS: Record<string, string[]> = {
	'about dark': [
		'--color-text-muted on --color-surface over --color-bg: 4.39',
		'--color-text-muted on --color-surface-muted over --color-bg: 3.82'
	],
	'career light': [
		'--color-text-muted on --color-bg: 3.94',
		'--color-accent-strong on --color-bg: 4.47'
	],
	'career dark': [
		'--color-text-muted on --color-surface over --color-bg: 4.23',
		'--color-text-muted on --color-surface-muted over --color-bg: 3.69'
	],
	'blog light': [
		'--color-text-muted on --color-surface-muted over --color-bg: 3.83',
		'--color-accent on --color-bg: 4.06'
	],
	'news light': ['--chrome-accent on --chrome-bg over --chrome-surface over --color-bg: 4.19'],
	'studio content surface light': [
		'--color-text-muted on --color-bg: 3.90',
		'--color-text-muted on --color-surface-muted over --color-bg: 4.28'
	],
	'prose light': [
		'--color-content-secondary on --color-content-bg: 3.90',
		'--color-content-mention on --color-content-bg: 4.42'
	]
};

/** The pages to check: each route theme, plus the paper-and-ink surface some studio pages use. */
const PAGES: Array<{ name: string; theme: SiteTheme; surface: SiteSurface; pairs: Pair[] }> = [
	...THEMES.map((theme) => ({
		name: theme,
		theme,
		surface: 'default' as const,
		pairs: theme === 'home' ? [...ROUTE_PAIRS, ...HOME_PAIRS] : ROUTE_PAIRS
	})),
	{ name: 'studio content surface', theme: 'studio', surface: 'content', pairs: ROUTE_PAIRS },
	{ name: 'prose', theme: 'blog', surface: 'default', pairs: PROSE_PAIRS }
];

describe('WCAG AA text contrast', () => {
	for (const page of PAGES) {
		for (const scheme of SCHEMES) {
			it(`${page.name} in ${scheme} mode`, () => {
				const tokens = resolveTokens(page.theme, page.surface, scheme);
				const failures = page.pairs.flatMap(([text, backgrounds]) => {
					const missing = [text, ...backgrounds].filter((name) => !tokens.has(name));
					if (missing.length > 0) {
						throw new Error(`${missing.join(', ')} doesn't resolve to a color; update the pairs.`);
					}
					const ratio = pairContrast(tokens, text, backgrounds);
					const label = `${text} on ${backgrounds.join(' over ')}`;
					return ratio < AA ? [`${label}: ${ratio.toFixed(2)}`] : [];
				});
				expect(failures).toEqual(EXCEPTIONS[`${page.name} ${scheme}`] ?? []);
			});
		}
	}
});

/** Stacks the backgrounds, then paints the text over them, since any of them can be translucent. */
function pairContrast(tokens: Map<string, Rgba>, text: string, backgrounds: string[]): number {
	const [base, ...layers] = backgrounds.map((name) => tokens.get(name)!).reverse() as [
		Rgba,
		...Rgba[]
	];
	if (base.a < 1) {
		throw new Error(`${backgrounds.at(-1)} isn't opaque, so it can't be the bottom layer.`);
	}
	const background = layers.reduce((under, layer) => composite(layer, under), base);
	return contrastRatio(composite(tokens.get(text)!, background), background);
}

// The cascade

interface TokenDeclaration {
	name: string;
	value: string;
	selectors: string[];
	media: string[];
}

/** Custom property declarations from the token files, in the order `app.css` imports them. */
const declarations: TokenDeclaration[] = (() => {
	const app = readFileSync(new URL('../../../app.css', import.meta.url), 'utf8');
	const files = [...app.matchAll(/@import '\$lib\/styles\/tokens\/([\w-]+\.css)'/g)].map(
		([, file]) => new URL(`./${file}`, import.meta.url)
	);
	return files.flatMap((file) => {
		const found: TokenDeclaration[] = [];
		postcss.parse(readFileSync(file, 'utf8')).walkDecls((declaration) => {
			if (!declaration.prop.startsWith('--')) return;
			const rule = declaration.parent;
			const selectors =
				rule?.type === 'rule' && 'selectors' in rule ? (rule.selectors as string[]) : [];
			const media: string[] = [];
			for (let parent = rule?.parent; parent; parent = parent.parent) {
				if (parent.type === 'atrule' && 'params' in parent) media.push(String(parent.params));
			}
			found.push({ name: declaration.prop, value: declaration.value, selectors, media });
		});
		return found;
	});
})();

/**
 * The root layout sets `data-theme` and `data-surface` on both `<html>` and the `.app` element
 * inside it. On `<html>`, `:root` and `[data-theme]` rules tie on specificity, so source order
 * decides; `.app` inherits from `<html>` and then applies its own `[data-theme]` rules. Each element
 * resolves `var()` against its own values, as the browser does.
 *
 * Media queries other than the color scheme hold layout and motion tokens, so the test leaves them
 * off, as on a narrow screen with motion allowed.
 */
function resolveTokens(theme: SiteTheme, surface: SiteSurface, scheme: Scheme): Map<string, Rgba> {
	const matches = (isRoot: boolean) => (declaration: TokenDeclaration) =>
		declaration.media.every((query) => query === `(prefers-color-scheme: ${scheme})`) &&
		declaration.selectors.some((selector) => {
			if (selector === ':root') return isRoot;
			const attribute = /^\[data-(theme|surface)='([\w-]+)'\]$/.exec(selector);
			if (!attribute)
				throw new Error(`The contrast test doesn't know which elements \`${selector}\` matches.`);
			return attribute[2] === (attribute[1] === 'theme' ? theme : surface);
		});

	const html = computeElement(declarations.filter(matches(true)), new Map());
	const app = computeElement(declarations.filter(matches(false)), html);

	const colors = new Map<string, Rgba>();
	for (const [name, value] of app) {
		const color = evaluateColor(value);
		if (color) colors.set(name, color);
	}
	return colors;
}

/** Applies declarations in order over inherited values, then substitutes every `var()`. */
function computeElement(
	applied: TokenDeclaration[],
	inherited: Map<string, string>
): Map<string, string> {
	const declared = new Map(applied.map(({ name, value }) => [name, value]));
	const computed = new Map(inherited);
	const resolving = new Set<string>();

	const resolve = (name: string): string | undefined => {
		const value = declared.get(name);
		if (value === undefined) return inherited.get(name);
		if (resolving.has(name)) return undefined;
		resolving.add(name);
		const result = substitute(value, resolve);
		resolving.delete(name);
		return result;
	};

	for (const name of declared.keys()) {
		const value = resolve(name);
		if (value === undefined) computed.delete(name);
		else computed.set(name, value);
	}
	return computed;
}

function substitute(
	value: string,
	lookup: (name: string) => string | undefined
): string | undefined {
	let missing = false;
	const parsed = valueParser(value);
	parsed.walk((node) => {
		if (node.type !== 'function' || node.value !== 'var') return;
		const [name, , ...fallback] = node.nodes;
		const found =
			lookup(name?.value ?? '') ??
			(fallback.length > 0 ? substitute(valueParser.stringify(fallback), lookup) : undefined);
		if (found === undefined) missing = true;
		Object.assign(node, { type: 'word', value: found ?? '' });
		return false;
	});
	return missing ? undefined : parsed.toString();
}

/** A plain color, `transparent`, or `color-mix(in srgb, …)`; anything else isn't a single color. */
function evaluateColor(value: string): Rgba | undefined {
	const text = value.trim();
	if (text === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
	const [node] = valueParser(text).nodes;
	if (node?.type === 'function' && node.value === 'color-mix') {
		const parts: string[] = [''];
		for (const child of node.nodes) {
			if (child.type === 'div' && child.value === ',') parts.push('');
			else parts[parts.length - 1] += valueParser.stringify(child);
		}
		const [space, first, second] = parts.map((part) => part.trim());
		if (space !== 'in srgb' || !first || !second) return undefined;
		const [x, y] = [first, second].map(mixPart);
		if (!x?.color || !y?.color) return undefined;
		const xWeight = x.weight ?? (y.weight === undefined ? 0.5 : 1 - y.weight);
		const yWeight = y.weight ?? 1 - xWeight;
		return mixColors(x.color, xWeight, y.color, yWeight);
	}
	return parseColor(text);
}

/** One color in a `color-mix()`, such as `#fff 20%`, with its weight as a fraction if given. */
function mixPart(part: string): { color: Rgba | undefined; weight: number | undefined } {
	const match = /^(.*?)\s+([\d.]+)%$/.exec(part);
	const color = evaluateColor(match ? match[1]! : part);
	return { color, weight: match ? Number(match[2]) / 100 : undefined };
}
