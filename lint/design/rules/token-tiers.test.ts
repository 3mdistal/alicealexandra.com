import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './token-tiers.ts';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const fixture = (name: string) =>
	fileURLToPath(new URL(`../fixtures/tiers/${name}`, import.meta.url));
const primitives = fixture('primitives.css');
const themes = fixture('themes.css');
const settings = { design: { tokenFiles: [primitives, themes], primitivesFile: primitives } };

const stylesheet = new RuleTester({ plugins: { css }, language: 'css/css', settings });

stylesheet.run('token-tiers in role token files', rule, {
	valid: [
		{
			filename: themes,
			code: `:root {
				--color-bg: var(--color-white);
				--color-border: color-mix(in srgb, var(--color-slate-900) 12%, transparent);
				--chrome-shadow: 0 14px 40px color-mix(in srgb, var(--color-slate-900) 18%, transparent);
				--color-ink: currentColor;
				--color-none: transparent;
				color-scheme: light dark;
			}
			@media (prefers-color-scheme: dark) { :root { --color-bg: var(--color-slate-900); } }`
		},
		{ filename: themes, code: ":root { --mask: url('#fff'); }" },
		{
			filename: themes,
			code: '@supports (color: color-mix(in srgb, red 50%, blue)) { :root { --color-bg: var(--color-white); } }'
		},
		// Words that are names here, not colors.
		{
			filename: themes,
			code: ':root { animation-name: orange; grid-area: tan; font-family: Gold, serif; }'
		},
		// Files outside the token files are for the color and length rules.
		{ filename: 'chrome.css', code: '.link { color: #0ea5e9; --space-1: 2px; }' }
	],
	invalid: [
		{
			filename: themes,
			code: ':root {\n\t--color-accent: #0ea5e9;\n}',
			errors: [
				{
					message:
						'`#0ea5e9` is a raw color in a role token file. Role tokens reference primitives from primitives.css, so every color comes from one palette. Use `var(--color-sky-500)`, which has the same value.',
					line: 2,
					column: 18,
					endColumn: 25
				}
			]
		},
		{
			filename: themes,
			code: ':root { --color-shadow: rgba(15, 23, 42, 0.12); }',
			errors: [
				{
					messageId: 'rawColor',
					data: {
						text: 'rgba(15, 23, 42, 0.12)',
						primitives: 'primitives.css',
						suggestion:
							'Use `color-mix(in srgb, var(--color-slate-900) 12%, transparent)`, which renders the same.'
					}
				}
			]
		},
		{
			filename: themes,
			code: "[data-theme='career'] { --color-accent: #6a3f2e; }",
			errors: [
				{
					messageId: 'rawColor',
					data: {
						text: '#6a3f2e',
						primitives: 'primitives.css',
						suggestion:
							'No primitive has this color. Closest: `--color-clay-700`, `--color-slate-900`, `--color-sky-500`. Use one of those, or add the color as a primitive.'
					}
				}
			]
		},
		{
			filename: themes,
			code: ':root { --chrome-shadow: 0 1px 2px black, 0 0 0 1px white; --color-x: var(--input, hsl(199 89% 48%)); }',
			errors: [
				{ messageId: 'rawColor', column: 36 },
				{ messageId: 'rawColor', column: 53 },
				{ messageId: 'rawColor', column: 84 }
			]
		},
		{
			filename: themes,
			code: ':root { --color-none: rgba(0, 0, 0, 0); }',
			errors: [
				{
					messageId: 'rawColor',
					data: {
						text: 'rgba(0, 0, 0, 0)',
						primitives: 'primitives.css',
						suggestion: 'Use `transparent`.'
					}
				}
			]
		},
		{
			filename: themes,
			code: ':root { --color-text: CanvasText; }',
			errors: [
				{
					messageId: 'rawColor',
					data: {
						text: 'CanvasText',
						primitives: 'primitives.css',
						suggestion: 'Add it as a primitive and reference that.'
					}
				}
			]
		},
		{
			filename: themes,
			code: '@media (prefers-color-scheme: dark) { :root { --color-sky-500: var(--color-white); } }',
			errors: [{ messageId: 'redefinedPrimitive', data: { name: '--color-sky-500' }, column: 47 }]
		}
	]
});

stylesheet.run('token-tiers in the primitives file', rule, {
	valid: [
		{
			filename: primitives,
			code: ':root { --space-1: 0.25rem; --shadow-1: 0 1px 3px rgba(15, 23, 42, 0.12); --color-white: #fff; }'
		}
	],
	invalid: [
		{
			filename: primitives,
			code: ':root { --space-1: 0.25rem; }\n@media (min-width: 640px) {\n\t:root { --space-1: 0.5rem; }\n}',
			errors: [
				{
					message:
						'`--space-1` is defined inside `@media (min-width: 640px) :root`. A primitive has one value everywhere, so define it only on the top-level `:root`, and put themed or responsive values in a role token file.',
					line: 3,
					column: 10
				}
			]
		},
		{
			// The `color` in the condition is a test, not a declaration, so only the placement is wrong.
			filename: primitives,
			code: '@supports (color: red) { :root { --space-1: 0.25rem; } }',
			errors: [
				{
					messageId: 'notOnRoot',
					data: { name: '--space-1', where: '@supports (color: red) :root' }
				}
			]
		},
		{
			filename: primitives,
			code: "[data-theme='blog'] { --color-white: #fafafa; }",
			errors: [
				{ messageId: 'notOnRoot', data: { name: '--color-white', where: "[data-theme='blog']" } }
			]
		},
		{
			filename: primitives,
			code: ':root { --space-2: calc(var(--space-1) * 2); --color-bg: var(--color-white); }',
			errors: [
				{ messageId: 'notRaw', data: { name: '--space-2', part: 'calc()' } },
				{ messageId: 'notRaw', data: { name: '--color-bg', part: 'var()' } }
			]
		},
		{
			filename: primitives,
			code: ':root { --color-ink: light-dark(#000, #fff); --inset: env(safe-area-inset-top); --step: round(1.5px, 1px); }',
			errors: [
				{ messageId: 'notRaw', data: { name: '--color-ink', part: 'light-dark()' } },
				{ messageId: 'notRaw', data: { name: '--inset', part: 'env()' } },
				{ messageId: 'notRaw', data: { name: '--step', part: 'round()' } }
			]
		},
		{
			filename: primitives,
			code: ':ROOT { --color-gray: color-mix(in srgb, #fff 50%, #000); }',
			errors: [{ messageId: 'notRaw', data: { name: '--color-gray', part: 'color-mix()' } }]
		},
		{
			filename: primitives,
			code: ':root {\n\t--space-1: 0.25rem;\n\t--space-1: 0.3rem;\n}',
			errors: [{ messageId: 'duplicate', data: { name: '--space-1', line: '2' }, line: 3 }]
		},
		{
			filename: primitives,
			code: ':root { color-scheme: light dark; }',
			errors: [
				{ messageId: 'notAToken', data: { name: 'color-scheme', primitives: 'primitives.css' } }
			]
		}
	]
});

const svelte = new RuleTester({ languageOptions: { parser: svelteParser }, settings });

svelte.run('token-tiers in .svelte files', rule, {
	// Components aren't token files, so the color and length rules cover them instead.
	valid: [{ filename: 'Card.svelte', code: '<style>p { color: #0ea5e9; }</style>' }],
	invalid: []
});
