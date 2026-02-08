import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { extractImageKitUrls, normalizePath } from './imagekit-core.mjs';

const DEFAULT_EXTENSIONS = ['.svelte', '.ts', '.js', '.json', '.md', '.css'];

const args = parseArgs(process.argv.slice(2));
const repoRoot = process.cwd();

main().catch((error) => {
	console.error(
		`assert-no-imagekit-urls: Fatal error - ${error instanceof Error ? error.message : String(error)}`
	);
	process.exit(1);
});

async function main() {
	const roots = args.paths.length > 0 ? [...args.paths] : ['content'];
	if (args.includeSrc) {
		roots.push('src');
	}

	/** @type {{ file: string; count: number }[]} */
	const offenders = [];

	for (const root of roots) {
		const fullRoot = path.resolve(repoRoot, root);
		if (!fsSync.existsSync(fullRoot)) continue;
		const files = await walkDirectory(fullRoot, new Set(DEFAULT_EXTENSIONS));
		for (const filePath of files) {
			const content = await fs.readFile(filePath, 'utf8');
			const urls = extractImageKitUrls(content);
			if (urls.length === 0) continue;
			offenders.push({
				file: normalizePath(path.relative(repoRoot, filePath)),
				count: urls.length
			});
		}
	}

	if (offenders.length > 0) {
		console.error(
			`assert-no-imagekit-urls: Found ${offenders.length} files still referencing ik.imagekit.io/tempoimmaterial.`
		);
		for (const offender of offenders) {
			console.error(`assert-no-imagekit-urls: ${offender.file} (${offender.count})`);
		}
		process.exit(1);
	}

	console.log('assert-no-imagekit-urls: No ImageKit URLs found in target paths.');
}

/** @param {string[]} cliArgs */
function parseArgs(cliArgs) {
	/** @type {{ paths: string[]; includeSrc: boolean }} */
	const options = {
		paths: [],
		includeSrc: false
	};

	for (let i = 0; i < cliArgs.length; i += 1) {
		const arg = cliArgs[i];
		if (arg === '--path') {
			const next = cliArgs[i + 1];
			if (typeof next === 'string' && next.length > 0) {
				options.paths.push(next);
				i += 1;
			}
		} else if (arg === '--include-src') {
			options.includeSrc = true;
		}
	}

	return options;
}

/** @param {string} root @param {Set<string>} extensionSet */
async function walkDirectory(root, extensionSet) {
	/** @type {string[]} */
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
