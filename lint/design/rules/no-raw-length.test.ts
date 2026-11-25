import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './no-raw-length.ts';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const fixture = (name: string) =>
	fileURLToPath(new URL(`../fixtures/lengths/${name}`, import.meta.url));
const primitives = fixture('primitives.css');
const roles = fixture('roles.css');
const settings = { design: { tokenFiles: [primitives, roles], primitivesFile: primitives } };

const stylesheet = new RuleTester({ plugins: { css }, language: 'css/css', settings });
const svelte = new RuleTester({ languageOptions: { parser: svelteParser }, settings });

const spacing = (text: string) =>
	`\`${text}\` is spacing written by hand. Spacing comes from the design tokens, so each scale stays in one place.`;
const fontSize = (text: string) =>
	`\`${text}\` is a font size written by hand. Font sizes come from the design tokens, so each scale stays in one place.`;
const radius = (text: string) =>
	`\`${text}\` is a corner radius written by hand. Corner radii come from the design tokens, so each scale stays in one place.`;
const noFallback =
	" It isn't fixed automatically, because a browser that can't read the rest of this value uses an earlier declaration instead, and wouldn't once the value has a `var()`.";

stylesheet.run('no-raw-length in stylesheets', rule, {
	valid: [
		{
			filename: 'card.css',
			code: `.card {
				margin: 0 auto;
				padding: var(--space-16) 5%;
				gap: 0px;
				border-radius: 50%;
				font-size: inherit;
				line-height: 1.2rem;
				letter-spacing: 0.5px;
				width: 320px;
				top: 1rem;
				border: 1px solid;
				scroll-margin-top: 4rem;
			}`
		},
		{ filename: 'card.css', code: '.card { padding: var(--card-padding, var(--space-16)); }' },
		// The viewport part of a formula isn't a design value.
		{
			filename: 'card.css',
			code: '.card { font-size: clamp(var(--font-size-16), 2vw, var(--font-size-20)); padding: max(var(--space-4), 2dvh); }'
		},
		// Naming a raw length in a custom property is how a component keeps one of its own.
		{ filename: 'card.css', code: '.card { --card-inset: 13px; padding: var(--card-inset); }' },
		{ filename: 'card.css', code: '@keyframes pop { from { padding: 13px; } }' },
		{ filename: 'card.css', code: '@-webkit-keyframes pop { from { padding: 13px; } }' },
		{ filename: 'card.css', code: '.card { font: inherit; }' },
		// Like a percentage, a length in `em` follows the text it sits in.
		{ filename: 'card.css', code: '.card { margin: 1.5em 0 0.5em; font-size: 0.95em; }' },
		// The token files are checked by design/token-tiers.
		{ filename: roles, code: ':root { --ui-gap: 1rem; } .card { padding: 1rem; }' }
	],
	invalid: [
		{
			filename: 'card.css',
			code: '.card {\n\tpadding: 0.25rem;\n}',
			output: '.card {\n\tpadding: var(--space-4);\n}',
			errors: [
				{
					message: `${spacing('0.25rem')} Use \`var(--space-4)\`, which has the same value.`,
					line: 2,
					column: 11,
					endColumn: 18
				}
			]
		},
		{
			// Every way of writing the same number and unit is exact, and role tokens with the value are named.
			filename: 'card.css',
			code: '.card { gap: .25REM 1.0rem; }',
			output: '.card { gap: var(--space-4) var(--space-16); }',
			errors: [
				{ message: `${spacing('.25REM')} Use \`var(--space-4)\`, which has the same value.` },
				{
					message: `${spacing('1.0rem')} Use \`var(--space-16)\`, which has the same value. A role token with this value: \`--ui-gap\`.`
				}
			]
		},
		{
			// Each property uses its own scale: 1rem is both a space and a font size.
			filename: 'card.css',
			code: '.card { font-size: 1rem; }',
			output: '.card { font-size: var(--font-size-16); }',
			errors: [
				{ message: `${fontSize('1rem')} Use \`var(--font-size-16)\`, which has the same value.` }
			]
		},
		{
			filename: 'card.css',
			code: '.card { border-top-left-radius: 8px; }',
			output: '.card { border-top-left-radius: var(--radius-8); }',
			errors: [{ message: `${radius('8px')} Use \`var(--radius-8)\`, which has the same value.` }]
		},
		{
			filename: 'card.css',
			code: '.card { border-radius: 8px / 999px; }',
			output: '.card { border-radius: var(--radius-8) / var(--radius-pill); }',
			errors: [{ messageId: 'rawLength' }, { messageId: 'rawLength' }]
		},
		...[
			'margin',
			'margin-top',
			'margin-inline',
			'margin-block-start',
			'padding-left',
			'padding-inline-end',
			'gap',
			'row-gap',
			'column-gap',
			'grid-gap',
			'grid-row-gap'
		].map((property) => ({
			filename: 'card.css',
			code: `.card { ${property}: 1rem !important; }`,
			output: `.card { ${property}: var(--space-16) !important; }`,
			errors: [{ messageId: 'rawLength' }]
		})),
		...['border-radius', 'border-bottom-right-radius', 'border-start-end-radius'].map(
			(property) => ({
				filename: 'card.css',
				code: `.card { ${property}: 8px; }`,
				output: `.card { ${property}: var(--radius-8); }`,
				errors: [{ messageId: 'rawLength' }]
			})
		),
		{
			// A fallback can't hide a raw length.
			filename: 'card.css',
			code: '.card { padding: var(--card-padding, 1rem); }',
			output: '.card { padding: var(--card-padding, var(--space-16)); }',
			errors: [{ messageId: 'rawLength', column: 38, endColumn: 42 }]
		},
		{
			// In `font`, the size is checked and the line height isn't.
			filename: 'card.css',
			code: ".card { font: bold 1rem / 1.5rem 'Lato', sans-serif; }",
			output: ".card { font: bold var(--font-size-16) / 1.5rem 'Lato', sans-serif; }",
			errors: [{ messageId: 'rawLength', column: 20 }]
		},
		{
			filename: 'card.css',
			code: '.card { font: var(--card-font, 1rem/1.5rem system-ui); }',
			output: '.card { font: var(--card-font, var(--font-size-16)/1.5rem system-ui); }',
			errors: [{ messageId: 'rawLength', column: 32 }]
		},
		{
			filename: 'card.css',
			code: '.card { padding: 13px; }',
			errors: [
				{
					message: `${spacing('13px')} No step on the scale has this value. Closest: \`--space-16\` (1rem) or \`--space-4\` (0.25rem). Use one of those, or add a token.`
				}
			]
		},
		{
			// Past the ends of the scale, the closest are the last two.
			filename: 'card.css',
			code: '.card { padding: 1px; margin: 9rem; }',
			errors: [
				{
					message: `${spacing('1px')} No step on the scale has this value. Closest: \`--space-4\` (0.25rem) or \`--space-16\` (1rem). Use one of those, or add a token.`
				},
				{
					message: `${spacing('9rem')} No step on the scale has this value. Closest: \`--space-32\` (2rem) or \`--space-16\` (1rem). Use one of those, or add a token.`
				}
			]
		},
		{
			// A role token with a value of its own is only suggested.
			filename: 'card.css',
			code: '.card { font-size: 1.125rem; }',
			errors: [
				{
					message: `${fontSize('1.125rem')} No step on the scale has this value. Closest: \`--font-size-16\` (1rem) or \`--font-size-20\` (1.25rem). Use one of those, or add a token. A role token with this value: \`--content-font-size-body\`.`
				}
			]
		},
		{
			// Nearly the same isn't the same, since math can multiply the difference.
			filename: 'card.css',
			code: '.card { padding: 1.0000009rem; }',
			errors: [{ messageId: 'rawLength' }]
		},
		{
			// The same size in another unit changes when a reader changes their text size.
			filename: 'card.css',
			code: '.card { padding: 16px; border-radius: 0.5rem; }',
			errors: [
				{
					message: `${spacing('16px')} \`--space-16\` (1rem) is the same size until a reader changes their browser's text size. If that's fine here, use \`var(--space-16)\`.`
				},
				{
					message: `${radius('0.5rem')} \`--radius-8\` (8px) is the same size until a reader changes their browser's text size. If that's fine here, use \`var(--radius-8)\`.`
				}
			]
		},
		{
			// A negative length needs math, so it's only suggested. No role token is negative.
			filename: 'card.css',
			code: '.card { margin: -1rem -16px -13px; }',
			errors: [
				{
					message: `${spacing('-1rem')} Use \`calc(-1 * var(--space-16))\`, which renders the same.`
				},
				{
					message: `${spacing('-16px')} \`--space-16\` (1rem) is the same size until a reader changes their browser's text size. If that's fine here, use \`calc(-1 * var(--space-16))\`.`
				},
				{
					message: `${spacing('-13px')} No step on the scale has this value. Closest: \`--space-16\` (1rem) or \`--space-4\` (0.25rem). Use one of those, or add a token.`
				}
			]
		},
		{
			// A unit that follows the window can't match a token.
			filename: 'card.css',
			code: '.card { padding: 2em 3vw; }',
			errors: [
				{
					message: `${spacing('3vw')} No token is in \`vw\`. Use a step on the scale (\`--space-4\` (0.25rem), \`--space-16\` (1rem), or \`--space-32\` (2rem)), or add a token.`
				}
			]
		},
		{
			// An older browser drops `clamp()` and uses the line before it, unless it has a `var()`.
			filename: 'card.css',
			code: '.card { font-size: 1.1rem; font-size: clamp(1rem, 2vw, 3rem); }',
			errors: [
				{ messageId: 'rawLength' },
				{
					message: `${fontSize('1rem')} Use \`var(--font-size-16)\`, which has the same value.${noFallback}`
				},
				{ messageId: 'rawLength' }
			]
		},
		{
			filename: 'card.css',
			code: '.card { padding: 1rem 2dvh; }',
			errors: [{ messageId: 'rawLength' }, { messageId: 'rawLength' }]
		},
		{
			// Even `calc()` can hold newer math, such as dividing by a length.
			filename: 'card.css',
			code: '.card { padding: 10px; padding: calc((1rem / 1px) * 2vw); }',
			errors: [
				{ messageId: 'rawLength' },
				{ messageId: 'rawLength', column: 39, endColumn: 43 },
				{ messageId: 'rawLength' }
			]
		},
		{
			// Math without spaces.
			filename: 'card.css',
			code: '.card { margin: calc((2*1rem)); padding: min(2*1rem, 3rem); }',
			errors: [
				{ messageId: 'rawLength', column: 25, endColumn: 29 },
				{ messageId: 'rawLength', column: 48, endColumn: 52 },
				{ messageId: 'rawLength', column: 54 }
			]
		},
		{
			// With a `var()` already there, another changes nothing.
			filename: 'card.css',
			code: '.card { padding: max(1rem, var(--space-4)); }',
			output: '.card { padding: max(var(--space-16), var(--space-4)); }',
			errors: [{ messageId: 'rawLength' }]
		}
	]
});

svelte.run('no-raw-length in .svelte files', rule, {
	valid: [
		{ filename: 'Card.svelte', code: '<style>p { padding: var(--space-16); }</style>' },
		{ filename: 'Card.svelte', code: '<p style="padding: 13px">Hi</p>' },
		// Not a number in CSS, so browsers drop it.
		{ filename: 'Card.svelte', code: '<style>p { padding: 1.rem; }</style>' }
	],
	invalid: [
		{
			filename: 'Card.svelte',
			code: '<p>Hi</p>\n<style>\n\tp {\n\t\t@media (min-width: 640px) {\n\t\t\tpadding: 1rem 13px;\n\t\t}\n\t}\n</style>',
			output:
				'<p>Hi</p>\n<style>\n\tp {\n\t\t@media (min-width: 640px) {\n\t\t\tpadding: var(--space-16) 13px;\n\t\t}\n\t}\n</style>',
			errors: [
				{ messageId: 'rawLength', line: 5, column: 13, endColumn: 17 },
				{ messageId: 'rawLength', line: 5, column: 18, endColumn: 22 }
			]
		},
		{
			// A comment in the value doesn't throw off the position.
			filename: 'Card.svelte',
			code: '<p>Hi</p>\n<style>\n\tp { margin: /* top */ 1rem 0 !important; }\n</style>',
			output:
				'<p>Hi</p>\n<style>\n\tp { margin: /* top */ var(--space-16) 0 !important; }\n</style>',
			errors: [{ messageId: 'rawLength', line: 3, column: 24, endColumn: 28 }]
		}
	]
});
