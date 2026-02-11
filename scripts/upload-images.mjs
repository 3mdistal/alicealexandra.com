import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
	canonicalizeImageKitUrl,
	extractImageKitUrls,
	deriveKeyBase,
	resolveFinalKey,
	applyKeySuffix,
	hasImageExtension,
	isContentFilePath,
	hasAllowedUrlPrefix,
	normalizePath
} from './imagekit-core.mjs';

const DEFAULT_OUTPUT_DIR = '.image-migration';
const DEFAULT_ALLOWED_SEGMENTS = ['blog', 'poems', 'postcards', 'studio', 'career'];
const DEFAULT_ALLOWED_PREFIXES = DEFAULT_ALLOWED_SEGMENTS.map((segment) => `${segment}/`);
const DEFAULT_EXTENSIONS = ['.svelte', '.ts', '.js', '.json', '.md', '.css'];

const args = parseArgs(process.argv.slice(2));
const repoRoot = process.cwd();
const outputDir = path.resolve(repoRoot, args.outputDir ?? DEFAULT_OUTPUT_DIR);
const downloadsDir = path.join(outputDir, 'downloads');

const allowedSegments = [...DEFAULT_ALLOWED_SEGMENTS, ...args.allowSegment];
const allowedPrefixes = [...DEFAULT_ALLOWED_PREFIXES, ...args.allowPrefix];
const allowAll = args.allowAll;

main().catch((error) => {
	console.error(
		`upload-images: Fatal error - ${error instanceof Error ? error.message : String(error)}`
	);
	process.exit(1);
});

async function main() {
	await fs.mkdir(outputDir, { recursive: true });
	const scanResults = await scanFiles({
		repoRoot,
		includeContent: args.includeContent,
		extraPaths: args.extraPath,
		extensions: DEFAULT_EXTENSIONS,
		allowedSegments,
		allowedPrefixes,
		allowAll
	});

	await writeJson(path.join(outputDir, 'scan.json'), scanResults);

	const plan = buildPlan(scanResults, {
		keyPrefix: args.keyPrefix ?? process.env['R2_KEY_PREFIX'],
		keySuffixMode: args.keySuffix
	});

	await writeJson(path.join(outputDir, 'plan.json'), plan);

	const manifestPath = path.join(outputDir, 'manifest.json');
	let manifest = await readJson(manifestPath);
	manifest = mergeManifest(manifest, plan);

	if (args.download) {
		await fs.mkdir(downloadsDir, { recursive: true });
		await downloadAssets(plan, manifest, {
			downloadsDir,
			concurrency: args.concurrency
		});
		await writeJson(manifestPath, manifest);
	}

	if (args.upload) {
		const uploadConfig = getUploadConfig(args.publicBaseUrl ?? process.env['R2_PUBLIC_BASE_URL']);
		await uploadAssets(manifest, {
			downloadsDir,
			concurrency: args.concurrency,
			cacheControl: args.cacheControl,
			s3: createS3Client(),
			uploadConfig
		});
		await writeJson(manifestPath, manifest);
	}

	if (args.emitMapping || args.download || args.upload) {
		const publicBaseUrl = args.publicBaseUrl ?? process.env['R2_PUBLIC_BASE_URL'];
		if (!publicBaseUrl) {
			throw new Error('R2_PUBLIC_BASE_URL is required to emit mapping JSON.');
		}
		const mapping = buildMapping(scanResults, manifest, publicBaseUrl);
		await writeJson(path.join(outputDir, 'mapping.json'), mapping);
	}

	logSummary(scanResults, plan, manifest, args);
}

/** @param {string[]} cliArgs */
function parseArgs(cliArgs) {
	/** @type {{
		outputDir: string | null;
		extraPath: string[];
		allowPrefix: string[];
		allowSegment: string[];
		allowAll: boolean;
		includeContent: boolean;
		download: boolean;
		upload: boolean;
		emitMapping: boolean;
		keyPrefix: string | null;
		keySuffix: string | null;
		publicBaseUrl: string | null;
		cacheControl: string | null;
		concurrency: number;
	}} */
	const options = {
		outputDir: null,
		extraPath: [],
		allowPrefix: [],
		allowSegment: [],
		allowAll: false,
		includeContent: true,
		download: false,
		upload: false,
		emitMapping: false,
		keyPrefix: null,
		keySuffix: null,
		publicBaseUrl: null,
		cacheControl: null,
		concurrency: 4
	};

	for (let i = 0; i < cliArgs.length; i += 1) {
		const arg = cliArgs[i];
		if (arg === '--output-dir') {
			options.outputDir = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--extra-path') {
			options.extraPath.push(cliArgs[i + 1]);
			i += 1;
		} else if (arg === '--allow-prefix') {
			options.allowPrefix.push(cliArgs[i + 1]);
			i += 1;
		} else if (arg === '--allow-segment') {
			options.allowSegment.push(cliArgs[i + 1]);
			i += 1;
		} else if (arg === '--allow-all') {
			options.allowAll = true;
		} else if (arg === '--no-content') {
			options.includeContent = false;
		} else if (arg === '--download') {
			options.download = true;
		} else if (arg === '--upload') {
			options.upload = true;
		} else if (arg === '--emit-mapping') {
			options.emitMapping = true;
		} else if (arg === '--key-prefix') {
			options.keyPrefix = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--key-suffix') {
			options.keySuffix = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--public-base-url') {
			options.publicBaseUrl = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--cache-control') {
			options.cacheControl = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--concurrency') {
			const value = Number(cliArgs[i + 1]);
			if (!Number.isNaN(value) && value > 0) {
				options.concurrency = value;
			}
			i += 1;
		}
	}

	return options;
}

async function scanFiles({
	repoRoot,
	includeContent,
	extraPaths,
	extensions,
	allowedSegments,
	allowedPrefixes,
	allowAll
}) {
	const extensionSet = new Set(extensions);
	const trackedFiles = listTrackedFiles(repoRoot)
		.map(normalizePath)
		.filter((filePath) => extensionSet.has(path.extname(filePath)));

	const extraFiles = new Set();
	const extraRoots = [];
	if (includeContent && fsSync.existsSync(path.join(repoRoot, 'content'))) {
		extraRoots.push('content');
	}
	for (const extra of extraPaths) {
		if (extra) extraRoots.push(extra);
	}

	for (const root of extraRoots) {
		const fullRoot = path.resolve(repoRoot, root);
		if (!fsSync.existsSync(fullRoot)) continue;
		const files = await walkDirectory(fullRoot, extensionSet);
		for (const file of files) {
			const relative = normalizePath(path.relative(repoRoot, file));
			extraFiles.add(relative);
		}
	}

	const allFiles = [...new Set([...trackedFiles, ...extraFiles])];
	const urlMap = new Map();
	const skipped = [];

	for (const filePath of allFiles) {
		const absolutePath = path.resolve(repoRoot, filePath);
		let content;
		try {
			content = await fs.readFile(absolutePath, 'utf8');
		} catch (error) {
			skipped.push({ file: filePath, url: null, reason: 'read-failed' });
			continue;
		}

		const urls = extractImageKitUrls(content);
		if (urls.length === 0) continue;

		for (const url of urls) {
			const canonical = canonicalizeImageKitUrl(url);
			if (!canonical) {
				skipped.push({ file: filePath, url, reason: 'invalid-url' });
				continue;
			}

			const allowByFile = isContentFilePath(filePath, allowedSegments);
			const allowByUrl = hasAllowedUrlPrefix(canonical.pathAfterAccount, allowedPrefixes);
			if (!allowAll && !allowByFile && !allowByUrl) {
				skipped.push({ file: filePath, url, reason: 'outside-scope' });
				continue;
			}

			const entry = urlMap.get(url) ?? {
				url,
				count: 0,
				files: new Set()
			};
			entry.count += 1;
			entry.files.add(filePath);
			urlMap.set(url, entry);
		}
	}

	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		allowlist: {
			segments: allowedSegments,
			prefixes: allowedPrefixes,
			allowAll
		},
		filesScanned: allFiles.length,
		urls: [...urlMap.values()].map((entry) => ({
			url: entry.url,
			count: entry.count,
			files: [...entry.files].sort()
		})),
		skipped
	};
}

function buildPlan(scanResults, { keyPrefix, keySuffixMode }) {
	const assets = new Map();
	const keyCollisions = new Map();
	const collisions = [];

	for (const entry of scanResults.urls) {
		const canonical = canonicalizeImageKitUrl(entry.url);
		if (!canonical) continue;
		const keyBase = deriveKeyBase(canonical.pathAfterAccount, keyPrefix);
		if (!keyBase) continue;

		const asset = assets.get(canonical.canonicalUrl) ?? {
			canonicalUrl: canonical.canonicalUrl,
			downloadUrl: canonical.downloadUrl,
			pathAfterAccount: canonical.pathAfterAccount,
			keyBase,
			hasExtension: hasImageExtension(keyBase),
			variants: new Set(),
			sources: new Set(),
			needsSuffix: false
		};

		asset.variants.add(entry.url);
		for (const file of entry.files) {
			asset.sources.add(file);
		}
		assets.set(canonical.canonicalUrl, asset);

		const existingKey = keyCollisions.get(keyBase);
		if (existingKey && existingKey !== canonical.canonicalUrl) {
			if (!keySuffixMode) {
				collisions.push({ keyBase, canonicalUrls: [existingKey, canonical.canonicalUrl] });
			} else {
				asset.needsSuffix = true;
				const previous = assets.get(existingKey);
				if (previous) previous.needsSuffix = true;
			}
		} else {
			keyCollisions.set(keyBase, canonical.canonicalUrl);
		}
	}

	if (collisions.length > 0) {
		const message = collisions
			.map((collision) => `${collision.keyBase} -> ${collision.canonicalUrls.join(', ')}`)
			.join(' | ');
		throw new Error(`Key collisions detected. Use --key-suffix sha8 to disambiguate. ${message}`);
	}

	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		keyPrefix: keyPrefix ?? null,
		keySuffixMode: keySuffixMode ?? null,
		assets: [...assets.values()].map((asset) => ({
			canonicalUrl: asset.canonicalUrl,
			downloadUrl: asset.downloadUrl,
			pathAfterAccount: asset.pathAfterAccount,
			keyBase: asset.keyBase,
			hasExtension: asset.hasExtension,
			needsSuffix: asset.needsSuffix,
			variants: [...asset.variants],
			sources: [...asset.sources]
		}))
	};
}

function mergeManifest(previous, plan) {
	const manifest = previous ?? {
		version: 1,
		generatedAt: new Date().toISOString(),
		assets: {}
	};
	manifest.generatedAt = new Date().toISOString();

	for (const asset of plan.assets) {
		const existing = manifest.assets[asset.canonicalUrl] ?? {};
		manifest.assets[asset.canonicalUrl] = {
			canonicalUrl: asset.canonicalUrl,
			downloadUrl: asset.downloadUrl,
			pathAfterAccount: asset.pathAfterAccount,
			keyBase: asset.keyBase,
			finalKey: existing.finalKey ?? null,
			contentType: existing.contentType ?? null,
			hasExtension: asset.hasExtension,
			needsSuffix: asset.needsSuffix,
			sha256: existing.sha256 ?? null,
			bytes: existing.bytes ?? null,
			status: {
				downloaded: existing.status?.downloaded ?? false,
				uploaded: existing.status?.uploaded ?? false
			},
			downloadPath: existing.downloadPath ?? null,
			variants: asset.variants,
			sources: asset.sources,
			error: existing.error ?? null
		};
	}

	return manifest;
}

async function downloadAssets(plan, manifest, { downloadsDir, concurrency }) {
	const assets = plan.assets.map((asset) => manifest.assets[asset.canonicalUrl]).filter(Boolean);
	await mapWithConcurrency(assets, concurrency, async (asset) => {
		if (asset.status.downloaded) {
			const existingPath = asset.downloadPath ?? path.join(downloadsDir, asset.keyBase);
			if (fsSync.existsSync(existingPath)) return;
			asset.status.downloaded = false;
		}
		try {
			const response = await fetchWithRetry(asset.downloadUrl, 3);
			if (!response.ok) {
				throw new Error(`Download failed: ${response.status} ${response.statusText}`);
			}
			const buffer = Buffer.from(await response.arrayBuffer());
			const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
			const contentType = response.headers.get('content-type');
			const normalizedContentType = contentType ? contentType.split(';')[0].trim() : null;
			const downloadPath = path.join(downloadsDir, asset.keyBase);
			await fs.mkdir(path.dirname(downloadPath), { recursive: true });
			await fs.writeFile(downloadPath, buffer);

			let finalKey = resolveFinalKey(asset.keyBase, normalizedContentType);
			if (asset.needsSuffix) {
				finalKey = applyKeySuffix(finalKey, sha256.slice(0, 8));
			}
			if (!finalKey) {
				throw new Error('Unable to resolve final key.');
			}

			const inferredContentType =
				normalizedContentType ?? inferContentTypeFromKey(finalKey) ?? null;
			asset.sha256 = sha256;
			asset.bytes = buffer.length;
			asset.contentType = inferredContentType;
			asset.finalKey = finalKey;
			asset.downloadPath = downloadPath;
			asset.status.downloaded = true;
			asset.error = null;
		} catch (error) {
			asset.error = error instanceof Error ? error.message : String(error);
			asset.status.downloaded = false;
		}
	});
}

async function uploadAssets(
	manifest,
	{ downloadsDir, concurrency, cacheControl, s3, uploadConfig }
) {
	const assets = Object.values(manifest.assets);
	await mapWithConcurrency(assets, concurrency, async (asset) => {
		if (!asset.status.downloaded || asset.status.uploaded) return;
		if (!asset.finalKey) {
			asset.error = 'Missing finalKey for upload.';
			return;
		}
		const downloadPath = asset.downloadPath ?? path.join(downloadsDir, asset.keyBase);
		if (!fsSync.existsSync(downloadPath)) {
			asset.error = `Missing downloaded file at ${downloadPath}`;
			return;
		}
		try {
			const body = await fs.readFile(downloadPath);
			const command = new PutObjectCommand({
				Bucket: uploadConfig.bucket,
				Key: asset.finalKey,
				Body: body,
				ContentType: asset.contentType ?? 'application/octet-stream',
				CacheControl: cacheControl ?? uploadConfig.cacheControl
			});
			await s3.send(command);
			asset.status.uploaded = true;
			asset.error = null;
		} catch (error) {
			asset.error = error instanceof Error ? error.message : String(error);
			asset.status.uploaded = false;
		}
	});
}

function buildMapping(scanResults, manifest, publicBaseUrl) {
	const normalizedBase = publicBaseUrl.replace(/\/+$/, '');
	const entries = {};

	for (const entry of scanResults.urls) {
		const canonical = canonicalizeImageKitUrl(entry.url);
		if (!canonical) continue;
		const asset = manifest.assets[canonical.canonicalUrl];
		if (!asset?.finalKey) continue;
		entries[entry.url] = `${normalizedBase}/${asset.finalKey}`;
	}

	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		baseUrl: normalizedBase,
		entries
	};
}

function getUploadConfig(publicBaseUrl) {
	const required = ['R2_ENDPOINT', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
	for (const key of required) {
		if (!process.env[key]) {
			throw new Error(`${key} is required to upload to R2.`);
		}
	}
	return {
		bucket: process.env['R2_BUCKET'],
		cacheControl: 'public, max-age=3600',
		publicBaseUrl
	};
}

function createS3Client() {
	return new S3Client({
		region: 'auto',
		endpoint: process.env['R2_ENDPOINT'],
		credentials: {
			accessKeyId: process.env['R2_ACCESS_KEY_ID'],
			secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']
		}
	});
}

function listTrackedFiles(repoRoot) {
	try {
		const output = execSync('git ls-files', { cwd: repoRoot, encoding: 'utf8' });
		return output.split('\n').filter(Boolean);
	} catch (error) {
		return [];
	}
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

async function writeJson(filePath, payload) {
	await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
	try {
		const content = await fs.readFile(filePath, 'utf8');
		return JSON.parse(content);
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
}

async function fetchWithRetry(url, attempts) {
	let lastError;
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'alicealexandra.com upload-images'
				}
			});
			return response;
		} catch (error) {
			lastError = error;
			await delay(300 * Math.pow(2, attempt));
		}
	}
	throw lastError;
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapWithConcurrency(items, concurrency, handler) {
	if (!items.length) return [];
	const results = new Array(items.length);
	let index = 0;

	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (index < items.length) {
			const currentIndex = index;
			index += 1;
			results[currentIndex] = await handler(items[currentIndex]);
		}
	});

	await Promise.all(workers);
	return results;
}

function logSummary(scanResults, plan, manifest, options) {
	const totalUrls = scanResults.urls.length;
	const totalAssets = plan.assets.length;
	const downloaded = Object.values(manifest.assets).filter(
		(asset) => asset.status.downloaded
	).length;
	const uploaded = Object.values(manifest.assets).filter((asset) => asset.status.uploaded).length;
	console.log(
		`upload-images: URLs ${totalUrls} | assets ${totalAssets} | downloaded ${downloaded} | uploaded ${uploaded}`
	);
	if (!options.download && !options.upload) {
		console.log('upload-images: Scan/plan complete (no download or upload flags provided).');
	}
}

function inferContentTypeFromKey(key) {
	const ext = path.extname(key).toLowerCase();
	if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
	if (ext === '.png') return 'image/png';
	if (ext === '.webp') return 'image/webp';
	if (ext === '.gif') return 'image/gif';
	if (ext === '.svg') return 'image/svg+xml';
	return null;
}
