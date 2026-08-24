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
	const match = value.match(
		/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2}))?$/
	);
	if (!match) return undefined;

	const [, yearText, monthText, dayText, hourText, minuteText, secondText, , timezone] = match;
	const year = Number(yearText);
	const month = Number(monthText);
	const day = Number(dayText);
	const calendarDate = new Date(Date.UTC(year, month - 1, day));
	if (
		calendarDate.getUTCFullYear() !== year ||
		calendarDate.getUTCMonth() !== month - 1 ||
		calendarDate.getUTCDate() !== day
	) {
		return undefined;
	}

	if (hourText !== undefined) {
		if (Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText) > 59) {
			return undefined;
		}
		if (timezone && timezone !== 'Z') {
			const [offsetHour, offsetMinute] = timezone.slice(1).split(':').map(Number);
			if ((offsetHour ?? 0) > 14 || (offsetMinute ?? 0) > 59) return undefined;
		}
	}

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
