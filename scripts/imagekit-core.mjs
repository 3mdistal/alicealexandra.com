import path from 'node:path';

export const IMAGEKIT_HOST = 'ik.imagekit.io';
export const IMAGEKIT_ACCOUNT = 'tempoimmaterial';
export const IMAGEKIT_BASE = `https://${IMAGEKIT_HOST}/${IMAGEKIT_ACCOUNT}`;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const CONTENT_TYPE_TO_EXTENSION = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
	['image/gif', 'gif'],
	['image/svg+xml', 'svg']
]);

/** @param {string} text */
export function extractImageKitUrls(text) {
	if (!text) return [];
	const regex = /(?:https?:)?\/\/ik\.imagekit\.io\/tempoimmaterial\/[^\s"'()<>]+/g;
	return text.match(regex) ?? [];
}

/** @param {string} rawUrl */
export function normalizeImageKitUrl(rawUrl) {
	if (!rawUrl) return null;
	if (rawUrl.startsWith('//')) {
		return `https:${rawUrl}`;
	}
	if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
		return rawUrl;
	}
	return null;
}

/** @param {string} rawUrl */
export function canonicalizeImageKitUrl(rawUrl) {
	const normalized = normalizeImageKitUrl(rawUrl);
	if (!normalized) return null;

	let url;
	try {
		url = new URL(normalized);
	} catch (error) {
		return null;
	}

	if (url.hostname !== IMAGEKIT_HOST) return null;
	const segments = url.pathname.split('/').filter(Boolean);
	if (segments[0] !== IMAGEKIT_ACCOUNT) return null;

	const rest = segments.slice(1);
	let removedPathTransform = false;
	if (rest.length > 0 && rest[0] && isPathTransformSegment(rest[0])) {
		rest.shift();
		removedPathTransform = true;
	}

	const canonicalPath = `/${IMAGEKIT_ACCOUNT}/${rest.join('/')}`;
	const canonicalUrl = new URL(url.origin);
	canonicalUrl.pathname = canonicalPath;

	const params = new URLSearchParams(url.search);
	const hadTransformParam = params.has('tr');
	const hadUpdatedAt = params.has('updatedAt');
	params.delete('tr');
	params.delete('updatedAt');
	const remainingParams = Array.from(params.entries());
	canonicalUrl.search = remainingParams.length > 0 ? params.toString() : '';

	const pathAfterAccount = rest.join('/');
	return {
		inputUrl: rawUrl,
		normalizedUrl: normalized,
		canonicalUrl: canonicalUrl.toString(),
		downloadUrl: canonicalUrl.toString(),
		pathAfterAccount,
		removedPathTransform,
		hadTransformParam,
		hadUpdatedAt,
		remainingQuery: remainingParams
	};
}

/** @param {string} segment */
export function isPathTransformSegment(segment) {
	if (!segment) return false;
	return segment.startsWith('tr:') || segment.startsWith('tr-') || segment.startsWith('tr~');
}

/** @param {string} pathAfterAccount @param {string | undefined | null} keyPrefix */
export function deriveKeyBase(pathAfterAccount, keyPrefix) {
	if (!pathAfterAccount) return null;
	const normalizedPrefix = keyPrefix ? keyPrefix.replace(/^[./]+/, '').replace(/\/+$/, '') : '';
	const combined = normalizedPrefix ? `${normalizedPrefix}/${pathAfterAccount}` : pathAfterAccount;
	return combined.replace(/^\/+/, '');
}

/** @param {string} key */
export function hasImageExtension(key) {
	if (!key) return false;
	return IMAGE_EXTENSIONS.has(path.extname(key).toLowerCase());
}

/** @param {string} contentType */
export function extensionFromContentType(contentType) {
	if (!contentType) return null;
	const [type] = contentType.split(';');
	const normalized = (type ?? '').trim().toLowerCase();
	if (!normalized) return null;
	return CONTENT_TYPE_TO_EXTENSION.get(normalized) ?? null;
}

/** @param {string} key @param {string} suffix */
export function applyKeySuffix(key, suffix) {
	if (!suffix || !key) return key;
	const ext = path.extname(key);
	if (!ext) {
		return `${key}-${suffix}`;
	}
	const base = key.slice(0, -ext.length);
	return `${base}-${suffix}${ext}`;
}

/** @param {string} keyBase @param {string | null} contentType */
export function resolveFinalKey(keyBase, contentType) {
	if (!keyBase) return null;
	if (hasImageExtension(keyBase)) return keyBase;
	if (!contentType) return keyBase;
	const ext = extensionFromContentType(contentType);
	if (!ext) return keyBase;
	return `${keyBase}.${ext}`;
}

/** @param {string} value */
export function normalizePath(value) {
	if (!value) return '';
	return value.split(path.sep).join('/');
}

/** @param {string} filePath @param {string[]} allowedSegments */
export function isContentFilePath(filePath, allowedSegments) {
	const normalized = normalizePath(filePath);
	if (normalized.startsWith('content/')) return true;
	return allowedSegments.some((segment) => normalized.includes(`/${segment}/`));
}

/** @param {string} pathAfterAccount @param {string[]} allowedPrefixes */
export function hasAllowedUrlPrefix(pathAfterAccount, allowedPrefixes) {
	if (!pathAfterAccount) return false;
	return allowedPrefixes.some((prefix) => pathAfterAccount.startsWith(prefix));
}
