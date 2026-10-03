import css from '@eslint/css';
import { RuleTester } from 'eslint';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import { describe, it } from 'vitest';
import rule from './no-unknown-token.ts';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const settings = {
	design: { tokenFiles: [fileURLToPath(new URL('../fixtures/tokens.css', import.meta.url))] }
};

const fontSizeMessage =
	"`--font-size-md` isn't defined in a token file or in this file, so the property silently resets to its inherited or initial value. Defined `--font-size-*` tokens: sm, base, lg. If a parent component sets it, give it a fallback: `var(--font-size-md, …)`.";

const svelte = new RuleTester({ languageOptions: { parser: svelteParser }, settings });

svelte.run('no-unknown-token in .svelte files', rule, {
	valid: [
		{ filename: 'Tokens.svelte', code: '<style>p { margin: var(--space-4); }</style>' },
		{
			filename: 'Input.svelte',
			code: '<style>p { color: var(--label-color, var(--color-accent)); }</style>'
		},
		{
			filename: 'LocalStyle.svelte',
			code: '<style>p { --gap: 2px; gap: var(--gap); }</style>'
		},
		{
			filename: 'StyleAttribute.svelte',
			code: '<li style="--delay: {i * 0.1}s"></li><style>li { animation-delay: var(--delay); }</style>'
		},
		{
			filename: 'StyleDirective.svelte',
			code: '<li style:--index={i}></li><style>li { order: var(--index); }</style>'
		},
		{
			filename: 'SetProperty.svelte',
			code: "<script>node.style.setProperty('--index', '1');</script><style>li { order: var(--index); }</style>"
		},
		{ filename: 'NoStyle.svelte', code: '<p>Hello</p>' }
	],
	invalid: [
		{
			filename: 'MobileMenu.svelte',
			code: '<style>\n\ta { font-size: var(--font-size-md); }\n</style>',
			errors: [{ message: fontSizeMessage, line: 2, column: 17, endLine: 2, endColumn: 36 }]
		},
		{
			filename: 'Form.svelte',
			code: '<style>label { color: var(--accentColor); }</style>',
			errors: [
				{
					messageId: 'unknownToken',
					data: {
						name: '--accentColor',
						suggestion: ' Did you mean `--color-accent`, `--color-accent-strong`, or `--color-bg`?'
					}
				}
			]
		},
		{
			filename: 'Nested.svelte',
			code: '<style>p { padding: calc(var(--gutter) * 2) var(--input, var(--missing)); }</style>',
			errors: [
				{ messageId: 'unknownToken', column: 26 },
				{ messageId: 'unknownToken', column: 58 }
			]
		}
	]
});

const stylesheet = new RuleTester({ plugins: { css }, language: 'css/css', settings });

stylesheet.run('no-unknown-token in .css files', rule, {
	valid: [
		{ filename: 'chrome.css', code: '.link { font-size: var(--font-size-base); }' },
		{ filename: 'chrome.css', code: '.link { --size: 1rem; font-size: var(--size); }' },
		{ filename: 'chrome.css', code: '.link { font-size: var(--size, 1rem); }' },
		{
			filename: 'chrome.css',
			code: '.link { color: var(--color-accent); &:hover { color: var(--color-bg); } }'
		}
	],
	invalid: [
		{
			filename: 'chrome.css',
			code: '.link {\n\tfont-size: var(--font-size-md);\n}',
			errors: [{ message: fontSizeMessage, line: 2, column: 13, endLine: 2, endColumn: 32 }]
		},
		{
			filename: 'chrome.css',
			code: '.link { margin: 0 var(--nowhere-at-all) !important; }',
			errors: [{ messageId: 'unknownToken', data: { name: '--nowhere-at-all', suggestion: '' } }]
		}
	]
});
