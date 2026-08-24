import { CANONICAL_ORIGIN } from '$lib/server/agent-readiness';

export interface SitemapEntry {
	path: string;
	lastmod?: string;
}

export const STATIC_SITEMAP_PATHS = [
	'/',
	'/about',
	'/career',
	'/career/builder',
	'/career/vercel',
	'/blog',
	'/news',
	'/studio',
	'/studio/illustrations',
	'/studio/tall-tales',
	'/studio/hfc',
	'/studio/postcards'
] as const;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function normalizeLastmod(value: string | undefined): string | undefined {
	if (!value?.trim()) return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function serializeSitemap(entries: SitemapEntry[]): string {
	const uniqueEntries = new Map<string, SitemapEntry>();
	for (const entry of entries) {
		if (!entry.path.startsWith('/')) continue;
		const lastmod = normalizeLastmod(entry.lastmod);
		uniqueEntries.set(entry.path, lastmod ? { ...entry, lastmod } : { path: entry.path });
	}

	const urls = [...uniqueEntries.values()]
		.sort((a, b) => a.path.localeCompare(b.path))
		.map((entry) => {
			const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			return `  <url>\n    <loc>${escapeXml(`${CANONICAL_ORIGIN}${entry.path}`)}</loc>${lastmod}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
