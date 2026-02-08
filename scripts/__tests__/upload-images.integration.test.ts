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

describe('upload-images integration', () => {
	it('scans svelte files and emits deterministic mapping from preseeded manifest', async () => {
		const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-images-it-'));
		tempDirs.push(repoRoot);

		await fs.mkdir(path.join(repoRoot, 'content', 'blog'), { recursive: true });
		await fs.mkdir(path.join(repoRoot, 'src', 'routes'), { recursive: true });
		await fs.mkdir(path.join(repoRoot, '.image-migration'), { recursive: true });

		const postUrl = 'https://ik.imagekit.io/tempoimmaterial/studio/ink.png?updatedAt=1694604654601';
		const svelteUrl = 'https://ik.imagekit.io/tempoimmaterial/tr:w-1500/studio/ink.png?updatedAt=1';

		await fs.writeFile(path.join(repoRoot, 'content', 'blog', 'post.md'), postUrl, 'utf8');
		await fs.writeFile(path.join(repoRoot, 'src', 'routes', '+page.svelte'), svelteUrl, 'utf8');

		const canonicalUrl = 'https://ik.imagekit.io/tempoimmaterial/studio/ink.png';
		await fs.writeFile(
			path.join(repoRoot, '.image-migration', 'manifest.json'),
			JSON.stringify(
				{
					version: 1,
					generatedAt: new Date(0).toISOString(),
					assets: {
						[canonicalUrl]: {
							finalKey: 'studio/ink.png',
							status: { downloaded: false, uploaded: false }
						}
					}
				},
				null,
				2
			),
			'utf8'
		);

		const runScript = () =>
			spawnSync(
				process.execPath,
				[
					path.resolve('scripts/upload-images.mjs'),
					'--emit-mapping',
					'--public-base-url',
					'https://images.alicealexandra.com',
					'--extra-path',
					'src'
				],
				{ cwd: repoRoot, encoding: 'utf8' }
			);

		const firstRun = runScript();
		expect(firstRun.status).toBe(0);

		const scan = JSON.parse(
			await fs.readFile(path.join(repoRoot, '.image-migration', 'scan.json'), 'utf8')
		);
		expect(scan.urls).toHaveLength(2);
		expect(
			scan.urls.some((entry: { files: string[] }) =>
				entry.files.includes('src/routes/+page.svelte')
			)
		).toBe(true);

		const firstPlan = JSON.parse(
			await fs.readFile(path.join(repoRoot, '.image-migration', 'plan.json'), 'utf8')
		);
		const firstMapping = JSON.parse(
			await fs.readFile(path.join(repoRoot, '.image-migration', 'mapping.json'), 'utf8')
		);
		expect(firstPlan.assets).toHaveLength(1);
		expect(firstMapping.entries[postUrl]).toBe('https://images.alicealexandra.com/studio/ink.png');
		expect(firstMapping.entries[svelteUrl]).toBe(
			'https://images.alicealexandra.com/studio/ink.png'
		);

		const secondRun = runScript();
		expect(secondRun.status).toBe(0);

		const secondPlan = JSON.parse(
			await fs.readFile(path.join(repoRoot, '.image-migration', 'plan.json'), 'utf8')
		);
		const secondMapping = JSON.parse(
			await fs.readFile(path.join(repoRoot, '.image-migration', 'mapping.json'), 'utf8')
		);

		expect(secondPlan.assets).toEqual(firstPlan.assets);
		expect(secondMapping.entries).toEqual(firstMapping.entries);
	});
});
