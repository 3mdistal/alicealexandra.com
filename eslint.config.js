import css from '@eslint/css';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import design from './lint/design/index.ts';

const tokenFiles = [
	'primitives.css',
	'themes.css',
	'prose.css',
	'components.css',
	'motion.css'
].map((file) => `${import.meta.dirname}/src/lib/styles/tokens/${file}`);
const [primitivesFile] = tokenFiles;

export default defineConfig(
	{
		files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts,svelte}'],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommended,
			svelte.configs['flat/recommended'],
			prettier,
			svelte.configs['flat/prettier']
		],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		// Keep `pnpm lint` usable as a quality gate by not failing on known/intentional patterns
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'no-useless-catch': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-at-html-tags': 'off',
			'svelte/require-each-key': 'off',
			'svelte/no-unused-svelte-ignore': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		},
		rules: {
			'no-useless-assignment': 'off'
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', 'content/', 'archived/', 'lint/design/fixtures/']
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'off'
		}
	},
	{
		files: ['scripts/**/*.ts'],
		rules: {
			'no-case-declarations': 'off'
		}
	},
	{
		files: ['**/*.css'],
		plugins: { css },
		language: 'css/css'
	},
	{
		files: ['**/*.svelte', '**/*.css'],
		plugins: { design },
		settings: { design: { tokenFiles, primitivesFile } },
		rules: {
			'design/no-raw-color': 'error',
			'design/no-unknown-token': 'error',
			'design/token-tiers': 'error'
		}
	}
);
