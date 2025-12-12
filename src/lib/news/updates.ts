export type NewsMainTab = 'about' | 'studio' | 'career' | 'blog' | 'site';

export type StudioNewsCategory = 'hfc' | 'postcards';

export type NewsTextSegment =
	| { type: 'text'; text: string }
	| { type: 'link'; text: string; href: string }
	| { type: 'title'; text: string };

export interface NewsEntry {
	id: string;
	date: string; // ISO (YYYY-MM-DD)
	area: 'studio';
	category: StudioNewsCategory;
	segments: NewsTextSegment[];
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

export const STUDIO_NEWS: NewsEntry[] = [
	{
		id: 'studio-postcards-2025-12-01-procedure-for-the-extraction-of-a-pulmonary-haunting',
		date: '2025-12-01',
		area: 'studio',
		category: 'postcards',
		segments: [
			{ type: 'text', text: 'New postcard: ' },
			{
				type: 'link',
				text: '“Procedure for the Extraction of a Pulmonary Haunting”',
				href: `/studio/postcards/${slugify('Procedure for the Extraction of a Pulmonary Haunting')}`
			},
			{ type: 'text', text: '' }
		]
	},
	{
		id: 'studio-hfc-2025-12-11-the-death-of-baldur',
		date: '2025-12-11',
		area: 'studio',
		category: 'hfc',
		segments: [
			{ type: 'text', text: 'New hymn: ' },
			{ type: 'link', text: '“the death of baldur”', href: '/studio/hfc' },
			{ type: 'text', text: '' }
		]
	},
	{
		id: 'studio-hfc-2025-12-11-portrait-of-the-body-as-a-failed-industry',
		date: '2025-12-11',
		area: 'studio',
		category: 'hfc',
		segments: [
			{ type: 'text', text: 'New hymn: ' },
			{ type: 'link', text: '“portrait of the body as a failed industry”', href: '/studio/hfc' },
			{ type: 'text', text: '' }
		]
	}
].sort((a, b) => b.date.localeCompare(a.date));


