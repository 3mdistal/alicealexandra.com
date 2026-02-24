import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

const INCLUDE_EXTENSIONS = new Set(['.svelte', '.css', '.ts', '.js']);

const RULES = [
	{
		name: 'No `outline: none` outside a11y foundation',
		pattern: /outline\s*:\s*none\b/g,
		allow: (filePath) => filePath.endsWith(path.join('src', 'lib', 'styles', 'a11y.css'))
	},
	{
		name: 'No direct reduced-motion matchMedia usage',
		pattern: /matchMedia\(\s*['"]\(prefers-reduced-motion:\s*reduce\)['"]\s*\)/g,
		allow: (filePath) =>
			filePath.endsWith(path.join('src', 'lib', 'accessibility', 'prefers-reduced-motion.ts'))
	},
	{
		name: 'No raw `:focus` selector (use :focus-visible)',
		pattern: /(?<!on):focus(?!-visible|-within)/g,
		allow: (filePath) => filePath.endsWith(path.join('src', 'lib', 'styles', 'a11y.css'))
	}
];

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(fullPath)));
			continue;
		}

		if (!INCLUDE_EXTENSIONS.has(path.extname(entry.name))) continue;
		files.push(fullPath);
	}

	return files;
}

function getLineNumber(text, index) {
	let line = 1;
	for (let i = 0; i < index; i += 1) {
		if (text[i] === '\n') line += 1;
	}
	return line;
}

async function main() {
	const files = await walk(SRC_DIR);
	const violations = [];

	for (const file of files) {
		const contents = await readFile(file, 'utf8');
		const relative = path.relative(ROOT, file);

		for (const rule of RULES) {
			if (rule.allow(relative)) continue;
			rule.pattern.lastIndex = 0;

			let match;
			while ((match = rule.pattern.exec(contents)) !== null) {
				violations.push({
					rule: rule.name,
					file: relative,
					line: getLineNumber(contents, match.index),
					value: match[0]
				});
			}
		}
	}

	if (violations.length === 0) {
		console.log('a11y guardrails check passed');
		return;
	}

	console.error('a11y guardrails violations found:\n');
	for (const violation of violations) {
		console.error(`- ${violation.rule}: ${violation.file}:${violation.line} (${violation.value})`);
	}

	process.exitCode = 1;
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
