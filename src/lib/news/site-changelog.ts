export type SiteUpdateSummary = {
	id: string;
	dateIso: string;
	dateLabel: string;
	summary: string;
	items: string[];
};

function toIsoDate(dateLike: string): string | null {
	// CHANGELOG uses e.g. "12 Dec 2025"
	const d = new Date(dateLike);
	if (Number.isNaN(d.getTime())) return null;
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function extractBullets(block: string, sectionTitle?: string): string[] {
	const lines = block.split('\n');
	let startIndex = 0;

	if (sectionTitle) {
		const headerIdx = lines.findIndex((l) => l.trim() === `**${sectionTitle}**`);
		if (headerIdx >= 0) startIndex = headerIdx + 1;
		else return [];
	}

	const bullets: string[] = [];
	for (let i = startIndex; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;
		const trimmed = line.trim();

		// Stop if we hit another section header
		if (/^\*\*.+\*\*$/.test(trimmed)) break;
		if (/^##\s+/.test(trimmed)) break;

		if (trimmed.startsWith('- ')) {
			bullets.push(trimmed.slice(2));
		}
	}

	return bullets;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function renderInlineCodeHtml(text: string): string {
	// Render inline-code spans from backticks, while escaping everything else.
	// We intentionally only support inline code here (no bold/links/etc) since this
	// is used in the compact “Site updates” cards.
	const parts = text.split('`');
	let html = '';
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i] ?? '';
		if (i % 2 === 1) html += `<code>${escapeHtml(part)}</code>`;
		else html += escapeHtml(part);
	}
	return html;
}

function cleanBulletHtml(text: string): string {
	const cleaned = text
		// remove PR refs anywhere (raw or linkified)
		.replace(/\(\s*#\d+\s*\)/g, '')
		.replace(/\(\s*\[#\d+\]\([^)]+\)\s*\)/g, '')
		.replace(/\[#\d+\]\([^)]+\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return renderInlineCodeHtml(cleaned);
}

function buildSummaryItems(bullets: string[]): string[] {
	return bullets.map(cleanBulletHtml).filter(Boolean).slice(0, 3);
}

function buildSummarySentence(): string {
	return '';
}

export function parseChangelogSummaries(markdown: string): SiteUpdateSummary[] {
	// Split into entry blocks on "## <heading>"
	const parts = markdown.split(/\n##\s+/);
	const first = parts.shift();
	const blocks = (first ? [first] : []).concat(parts.map((p) => `## ${p}`)).filter(Boolean);

	const summaries: SiteUpdateSummary[] = [];

	for (const block of blocks) {
		const headingMatch = block.match(/^##\s+([^\n]+)\n/m);
		const heading = headingMatch?.[1]?.trim();
		if (!heading) continue;

		// Old format: "## <version>" then "_<date label>_"
		// New format: "## <date label>" (no version numbers)
		const dateMatch = block.match(/\n_([^_]+)_\n/);
		const dateLabel = (dateMatch?.[1]?.trim() ?? heading).trim();
		const dateIso = dateLabel ? toIsoDate(dateLabel) : null;
		if (!dateIso) continue;

		const featureBullets = extractBullets(block, 'Features');
		const enhancementBullets = extractBullets(block, 'Enhancements');
		const refactorBullets = extractBullets(block, 'Refactors');
		const patchBullets = extractBullets(block, 'Patches');
		const bugfixBullets = extractBullets(block, 'Bugfixes');

		// Prefer Features, then Enhancements, etc.
		const bullets =
			featureBullets.length > 0
				? featureBullets
				: enhancementBullets.length > 0
					? enhancementBullets
					: refactorBullets.length > 0
						? refactorBullets
						: patchBullets.length > 0
							? patchBullets
							: bugfixBullets;

		const items = buildSummaryItems(bullets);

		summaries.push({
			id: `site-${dateIso}-${summaries.length}`,
			dateIso,
			dateLabel,
			summary: buildSummarySentence(),
			items
		});
	}

	return summaries.sort((a, b) => b.dateIso.localeCompare(a.dateIso));
}


