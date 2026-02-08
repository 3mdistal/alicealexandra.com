import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const tempDirs: string[] = [];

afterEach(async () => {
	for (const dir of tempDirs.splice(0, tempDirs.length)) {
		await fs.rm(dir, { recursive: true, force: true });
	}
});

describe('rewrite-image-urls integration', () => {
	it('keeps dry-run non-mutating and writes when requested', async () => {
		const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'rewrite-image-it-'));
		tempDirs.push(repoRoot);

		await fs.mkdir(path.join(repoRoot, 'content', 'blog'), { recursive: true });
		await fs.mkdir(path.join(repoRoot, 'src', 'routes'), { recursive: true });
		await fs.mkdir(path.join(repoRoot, '.image-migration'), { recursive: true });

		const oldUrl = 'https://ik.imagekit.io/tempoimmaterial/studio/ink.png?updatedAt=1';
		const newUrl = 'https://images.alicealexandra.com/studio/ink.png';

		await fs.writeFile(path.join(repoRoot, 'content', 'blog', 'post.md'), oldUrl, 'utf8');
		await fs.writeFile(path.join(repoRoot, 'src', 'routes', '+page.svelte'), oldUrl, 'utf8');
		await fs.writeFile(
			path.join(repoRoot, '.image-migration', 'mapping.json'),
			JSON.stringify({ version: 1, entries: { [oldUrl]: newUrl } }, null, 2),
			'utf8'
		);

		const scriptPath = path.resolve('scripts/rewrite-image-urls.mjs');

		const dryRun = spawnSync(
			process.execPath,
			[scriptPath, '--mapping', '.image-migration/mapping.json'],
			{
				cwd: repoRoot,
				encoding: 'utf8'
			}
		);

		expect(dryRun.status).toBe(0);
		expect(dryRun.stdout).toContain('Planned 1 replacements across 1 files.');
		expect(await fs.readFile(path.join(repoRoot, 'content', 'blog', 'post.md'), 'utf8')).toContain(
			oldUrl
		);
		expect(
			await fs.readFile(path.join(repoRoot, 'src', 'routes', '+page.svelte'), 'utf8')
		).toContain(oldUrl);

		const writeRun = spawnSync(
			process.execPath,
			[scriptPath, '--mapping', '.image-migration/mapping.json', '--include-src', '--write'],
			{ cwd: repoRoot, encoding: 'utf8' }
		);

		expect(writeRun.status).toBe(0);
		expect(writeRun.stdout).toContain('Wrote 2 replacements across 2 files.');
		expect(await fs.readFile(path.join(repoRoot, 'content', 'blog', 'post.md'), 'utf8')).toContain(
			newUrl
		);
		expect(
			await fs.readFile(path.join(repoRoot, 'src', 'routes', '+page.svelte'), 'utf8')
		).toContain(newUrl);
	});
});
