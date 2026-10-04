import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './no-raw-color.ts';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const fixture = (name: string) =>
	fileURLToPath(new URL(`../fixtures/tiers/${name}`, import.meta.url));
const primitives = fixture('primitives.css');
const themes = fixture('themes.css');
const settings = { design: { tokenFiles: [primitives, themes], primitivesFile: primitives } };

const stylesheet = new RuleTester({ plugins: { css }, language: 'css/css', settings });
const svelte = new RuleTester({ languageOptions: { parser: svelteParser }, settings });

const prefix = (text: string) =>
	`\`${text}\` is a raw color. Colors come from the design tokens, so the palette stays in one place.`;
const halfWhite = 'rgba(255, 255, 255, 0.5)';
const halfWhiteMix = 'color-mix(in srgb, var(--color-white) 50%, transparent)';
const halfWhiteMessage = `${prefix(halfWhite)} Use \`${halfWhiteMix}\`, which renders the same.`;

stylesheet.run('no-raw-color in stylesheets', rule, {
	valid: [
		{
			filename: 'card.css',
			code: `.card {
				color: var(--color-sky-500);
				background: color-mix(in srgb, var(--color-slate-900) 12%, transparent);
				border-color: currentColor;
				outline-color: transparent;
				box-shadow: var(--shadow-1);
			}`
		},
		{ filename: 'card.css', code: '.card { color: var(--card-ink, var(--color-sky-500)); }' },
		// Words that are names here, not colors.
		{ filename: 'card.css', code: '.card { animation-name: orange; font-family: Gold, serif; }' },
		{ filename: 'card.css', code: ".card { mask: url('#fff'); }" },
		// The token files are checked by design/token-tiers.
		{ filename: themes, code: ':root { --color-accent: #0ea5e9; }' },
		{ filename: primitives, code: ':root { --color-ink: #123456; }' }
	],
	invalid: [
		{
			filename: 'card.css',
			code: '.card {\n\tcolor: #0ea5e9;\n}',
			output: '.card {\n\tcolor: var(--color-sky-500);\n}',
			errors: [
				{
					message: `${prefix('#0ea5e9')} Use \`var(--color-sky-500)\`, which has the same value.`,
					line: 2,
					column: 9,
					endColumn: 16
				}
			]
		},
		{
			// An opaque match also names the role tokens set to that primitive.
			filename: 'card.css',
			code: '.card { background: white; }',
			output: '.card { background: var(--color-white); }',
			errors: [
				{
					message: `${prefix('white')} Use \`var(--color-white)\`, which has the same value. To follow the route theme and color scheme instead, use a role token such as \`--color-bg\`.`
				}
			]
		},
		{
			filename: 'card.css',
			code: '.card { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12); }',
			output:
				'.card { box-shadow: 0 1px 3px color-mix(in srgb, var(--color-slate-900) 12%, transparent); }',
			errors: [
				{
					message: `${prefix('rgba(15, 23, 42, 0.12)')} Use \`color-mix(in srgb, var(--color-slate-900) 12%, transparent)\`, which renders the same.`
				}
			]
		},
		{
			// A fallback can't hide a raw color.
			filename: 'card.css',
			code: '.card { color: var(--card-ink, #fff); }',
			output: '.card { color: var(--card-ink, var(--color-white)); }',
			errors: [{ messageId: 'rawColor', column: 32, endColumn: 36 }]
		},
		{
			filename: 'card.css',
			code: '.card { background: linear-gradient(#fff, #0ea5e9); }',
			output: '.card { background: linear-gradient(var(--color-white), var(--color-sky-500)); }',
			errors: [{ messageId: 'rawColor' }, { messageId: 'rawColor' }]
		},
		{
			filename: 'card.css',
			code: '.card { color: rgba(0, 0, 0, 0); }',
			output: '.card { color: transparent; }',
			errors: [{ message: `${prefix('rgba(0, 0, 0, 0)')} Use \`transparent\`.` }]
		},
		{
			// Stops of two hues blend in sRGB, and a color-mix() stop would switch them to OKLab.
			filename: 'card.css',
			code: `.card { background: linear-gradient(to right, var(--color-sky-500), ${halfWhite}); }`,
			output: `.card { background: linear-gradient(to right in srgb, var(--color-sky-500), ${halfWhiteMix}); }`,
			errors: [
				{
					message: `${halfWhiteMessage} In this gradient, a \`color-mix()\` stop would switch blending from sRGB to OKLab and shift the colors between stops, so the fix also adds \`in srgb\`.`
				}
			]
		},
		{
			filename: 'card.css',
			code: `.card { background: linear-gradient(var(--color-sky-500), ${halfWhite}); }`,
			output: `.card { background: linear-gradient(in srgb, var(--color-sky-500), ${halfWhiteMix}); }`,
			errors: [{ messageId: 'rawColor' }]
		},
		{
			filename: 'card.css',
			code: `.card { background: radial-gradient(circle at top, var(--color-sky-500), ${halfWhite}); }`,
			output: `.card { background: radial-gradient(circle at top in srgb, var(--color-sky-500), ${halfWhiteMix}); }`,
			errors: [{ messageId: 'rawColor' }]
		},
		{
			// One hue fading out blends the same in any color space.
			filename: 'card.css',
			code: '.card { background: linear-gradient(to top, rgba(255, 255, 255, 0.15), transparent); }',
			output:
				'.card { background: linear-gradient(to top, color-mix(in srgb, var(--color-white) 15%, transparent), transparent); }',
			errors: [{ messageId: 'rawColor' }]
		},
		{
			// The gradient already names its color space, or already blends in OKLab.
			filename: 'card.css',
			code: `.card { background: linear-gradient(to right in oklab, var(--color-sky-500), ${halfWhite}); }`,
			output: `.card { background: linear-gradient(to right in oklab, var(--color-sky-500), ${halfWhiteMix}); }`,
			errors: [{ message: halfWhiteMessage }]
		},
		{
			filename: 'card.css',
			code: `.card { background: linear-gradient(${halfWhiteMix}, var(--color-sky-500), ${halfWhite}); }`,
			output: `.card { background: linear-gradient(${halfWhiteMix}, var(--color-sky-500), ${halfWhiteMix}); }`,
			errors: [{ message: halfWhiteMessage }]
		},
		{
			// A role token can be either kind of color, so the blend could change either way.
			filename: 'card.css',
			code: `.card { background: linear-gradient(var(--color-bg), ${halfWhite}); }`,
			output: null,
			errors: [
				{
					message: `${halfWhiteMessage} In a gradient, a \`color-mix()\` stop switches blending from sRGB to OKLab, which shifts the colors between stops of different hues. This gradient's other stops are tokens that can change with the theme, so it isn't fixed automatically. If every stop resolves to a hex, \`rgb()\`, \`hsl()\` or named color, add \`in srgb\` as well.`
				}
			]
		},
		{
			// No primitive matches, so there's nothing to fix automatically.
			filename: 'card.css',
			code: '.card { color: #0da4e8; }',
			output: null,
			errors: [
				{
					message: `${prefix('#0da4e8')} No primitive has this color. Closest: \`--color-sky-500\`, \`--color-white\`, \`--color-clay-700\`. Use one of those, or add the color as a primitive.`
				}
			]
		}
	]
});

svelte.run('no-raw-color in .svelte files', rule, {
	valid: [{ filename: 'Card.svelte', code: '<style>p { color: var(--color-white); }</style>' }],
	invalid: [
		{
			filename: 'Card.svelte',
			code: '<p>Hi</p>\n<style>\n\tp { --card-ink: #0ea5e9; }\n</style>',
			output: '<p>Hi</p>\n<style>\n\tp { --card-ink: var(--color-sky-500); }\n</style>',
			errors: [{ messageId: 'rawColor', line: 3, column: 18, endColumn: 25 }]
		}
	]
});
