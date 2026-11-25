import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './no-primitive-color.ts';

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

const prefix = (name: string) =>
	`\`${name}\` is a palette color, so it stays the same in dark mode and on every route theme.`;
const textRoles =
	'Use a role token that follows them, such as `--color-text`, `--color-text-muted`, or `--color-accent`.';
const skyMessage = `${prefix('--color-sky-500')} ${textRoles}`;

stylesheet.run('no-primitive-color in stylesheets', rule, {
	valid: [
		{
			filename: 'card.css',
			code: `.card {
				color: var(--color-bg);
				background: color-mix(in srgb, var(--color-bg) 92%, var(--color-fixed-white));
				padding: var(--space-4);
				box-shadow: var(--shadow-1);
			}`
		},
		{ filename: 'card.css', code: '.card { color: var(--card-ink, var(--color-bg)); }' },
		// A declaration written for one color scheme may use a primitive.
		{
			filename: 'card.css',
			code: '@media (prefers-color-scheme: light) { .card { box-shadow: 0 1px 3px var(--color-clay-700); } }'
		},
		{
			filename: 'card.css',
			code: '.card { @media screen and (prefers-color-scheme: dark) { color: var(--color-white); } }'
		},
		// Roles are made from primitives, and design/token-tiers checks the token files.
		{ filename: themes, code: ':root { --color-accent: var(--color-sky-500); }' }
	],
	invalid: [
		{
			filename: 'card.css',
			code: '.card {\n\tcolor: var(--color-sky-500);\n}',
			errors: [{ message: skyMessage, line: 2, column: 9, endColumn: 29 }]
		},
		{
			// Roles set to the same primitive come first, then any fixed role.
			filename: 'card.css',
			code: '.card { background: var(--color-white); }',
			errors: [
				{
					message: `${prefix('--color-white')} Use a role token that follows them, such as \`--color-bg\`. If it must stay the same in every theme, as text and scrims over a photo do, use \`--color-fixed-white\`.`
				}
			]
		},
		{
			filename: 'card.css',
			code: '.card { box-shadow: 0 1px 3px color-mix(in srgb, var(--color-slate-900) 12%, transparent); }',
			errors: [
				{
					message: `${prefix('--color-slate-900')} Use a role token that follows them, such as \`--color-shadow\`.`
				}
			]
		},
		{
			// A fallback is checked too.
			filename: 'card.css',
			code: '.card { color: var(--card-ink, var(--color-sky-500)); }',
			errors: [{ message: skyMessage, column: 32, endColumn: 52 }]
		},
		{
			// Only a color-scheme query makes a primitive safe; a width query doesn't.
			filename: 'card.css',
			code: '@media (min-width: 640px) { .card { color: var(--color-sky-500); } }',
			errors: [{ message: skyMessage }]
		}
	]
});

svelte.run('no-primitive-color in .svelte files', rule, {
	valid: [
		{ filename: 'Card.svelte', code: '<style>p { color: var(--color-fixed-white); }</style>' }
	],
	invalid: [
		{
			filename: 'Card.svelte',
			code: '<p>Hi</p>\n<style>\n\tp { --card-ink: var(--color-sky-500); }\n</style>',
			errors: [{ messageId: 'primitiveColor', line: 3, column: 18, endColumn: 38 }]
		}
	]
});
