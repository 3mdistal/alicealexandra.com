// @ts-nocheck
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MAPPING = '.image-migration/mapping.json';
const DEFAULT_EXTENSIONS = ['.svelte', '.ts', '.js', '.json', '.md', '.css'];

const args = parseArgs(process.argv.slice(2));
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const mappingPath = path.resolve(repoRoot, args.mapping ?? DEFAULT_MAPPING);

try {
	const mapping = await readJson(mappingPath);
	if (!mapping?.entries || typeof mapping.entries !== 'object') {
		throw new Error('Mapping JSON missing entries.');
	}

	const targets = await listTargetFiles({
		repoRoot,
		paths: args.paths,
		includeSrc: args.includeSrc,
		extensions: DEFAULT_EXTENSIONS
	});

	const summary = [];
	for (const filePath of targets) {
		const absolutePath = path.resolve(repoRoot, filePath);
		const original = await fs.readFile(absolutePath, 'utf8');
		let updated = original;
		let replacements = 0;

		for (const [oldUrl, newUrl] of Object.entries(mapping.entries)) {
			if (!updated.includes(oldUrl)) continue;
			const count = countOccurrences(updated, oldUrl);
			updated = updated.split(oldUrl).join(newUrl);
			replacements += count;
			if (updated.includes(oldUrl)) {
				throw new Error(`Replacement failed for ${oldUrl} in ${filePath}`);
			}
		}

		if (replacements === 0) continue;
		summary.push({ file: filePath, replacements });

		if (args.write) {
			await fs.writeFile(absolutePath, updated, 'utf8');
		}
	}

	printSummary(summary, args.write);
} catch (error) {
	console.error(
		`rewrite-image-urls: Fatal error - ${error instanceof Error ? error.message : String(error)}`
	);
	process.exit(1);
}

function parseArgs(cliArgs) {
	const options = {
		mapping: null,
		paths: [],
		includeSrc: false,
		write: false
	};

	for (let i = 0; i < cliArgs.length; i += 1) {
		const arg = cliArgs[i];
		if (arg === '--mapping') {
			options.mapping = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--path') {
			options.paths.push(cliArgs[i + 1]);
			i += 1;
		} else if (arg === '--include-src') {
			options.includeSrc = true;
		} else if (arg === '--write') {
			options.write = true;
		}
	}

	return options;
}

async function listTargetFiles({ repoRoot, paths, includeSrc, extensions }) {
	const extensionSet = new Set(extensions);
	const targets = new Set();
	const roots = paths.length > 0 ? paths : ['content'];

	if (includeSrc) {
		roots.push('src');
	}

	for (const root of roots) {
		const fullRoot = path.resolve(repoRoot, root);
		if (!fsSync.existsSync(fullRoot)) continue;
		const files = await walkDirectory(fullRoot, extensionSet);
		for (const filePath of files) {
			targets.add(path.relative(repoRoot, filePath));
		}
	}

	return [...targets];
}

async function walkDirectory(root, extensionSet) {
	const results = [];
	const entries = await fs.readdir(root, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name === '.git' || entry.name === 'node_modules') continue;
		const fullPath = path.join(root, entry.name);
		if (entry.isDirectory()) {
			results.push(...(await walkDirectory(fullPath, extensionSet)));
		} else if (extensionSet.has(path.extname(entry.name))) {
			results.push(fullPath);
		}
	}
	return results;
}

async function readJson(filePath) {
	try {
		const content = await fs.readFile(filePath, 'utf8');
		return JSON.parse(content);
	} catch (error) {
		throw error;
	}
}

function countOccurrences(text, needle) {
	if (!needle) return 0;
	let count = 0;
	let index = 0;
	while ((index = text.indexOf(needle, index)) !== -1) {
		count += 1;
		index += needle.length;
	}
	return count;
}

function printSummary(summary, wrote) {
	if (summary.length === 0) {
		console.log('rewrite-image-urls: No replacements needed.');
		return;
	}
	const total = summary.reduce((sum, item) => sum + item.replacements, 0);
	console.log(
		`rewrite-image-urls: ${wrote ? 'Wrote' : 'Planned'} ${total} replacements across ${summary.length} files.`
	);
	for (const item of summary) {
		console.log(`rewrite-image-urls: ${item.file} (${item.replacements})`);
	}
}
