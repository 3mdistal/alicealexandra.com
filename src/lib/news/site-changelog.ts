export type SiteUpdateSummary = {
	id: string;
	version: string;
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

function cleanBulletText(text: string): string {
	return text
		// remove PR refs anywhere (raw or linkified)
		.replace(/\(\s*#\d+\s*\)/g, '')
		.replace(/\(\s*\[#\d+\]\([^)]+\)\s*\)/g, '')
		.replace(/\[#\d+\]\([^)]+\)/g, '')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildSummaryItems(bullets: string[]): string[] {
	return bullets.map(cleanBulletText).filter(Boolean).slice(0, 3);
}

function buildSummarySentence(version: string): string {
	return `Released ${version}.`;
}

export function parseChangelogSummaries(markdown: string): SiteUpdateSummary[] {
	// Split into release blocks on "## x.y.z"
	const parts = markdown.split(/\n##\s+/);
	const first = parts.shift();
	const blocks = (first ? [first] : []).concat(parts.map((p) => `## ${p}`)).filter(Boolean);

	const summaries: SiteUpdateSummary[] = [];

	for (const block of blocks) {
		const versionMatch = block.match(/^##\s+([^\n]+)\n/m);
		if (!versionMatch) continue;
		const version = versionMatch[1].trim();

		const dateMatch = block.match(/\n_([^_]+)_\n/);
		const dateLabel = dateMatch?.[1]?.trim() ?? '';
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
			id: `site-${version}-${dateIso}`,
			version,
			dateIso,
			dateLabel,
			summary: buildSummarySentence(version),
			items
		});
	}

	return summaries.sort((a, b) => b.dateIso.localeCompare(a.dateIso));
}


