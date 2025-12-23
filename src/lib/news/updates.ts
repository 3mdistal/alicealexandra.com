export type NewsMainTab = 'about' | 'studio' | 'career' | 'blog' | 'site';

export type StudioNewsCategory = 'hfc' | 'postcards';

export type StudioNewsAction = 'added' | 'edited' | 'removed';

export interface NewsEntry {
	id: string;
	date: string; // ISO (YYYY-MM-DD)
	area: 'studio';
	category: StudioNewsCategory;
	action: StudioNewsAction;
	title: string;
	href: string;
}

export const STUDIO_NEWS: NewsEntry[] = (
	[
		{
			id: 'studio-postcards-2025-12-01-procedure-for-the-extraction-of-a-pulmonary-haunting',
			date: '2025-12-01',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Procedure for the Extraction of a Pulmonary Haunting',
			href: '/studio/postcards/procedure-for-the-extraction-of-a-pulmonary-haunting'
		},
		{
			id: 'studio-postcards-2024-07-23-the-lightswitch',
			date: '2024-07-23',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'The Lightswitch',
			href: '/studio/postcards/the-lightswitch'
		},
		{
			id: 'studio-postcards-2021-05-07-highway',
			date: '2021-05-07',
			area: 'studio',
			category: 'postcards',
			action: 'edited',
			title: 'Highway',
			href: '/studio/postcards/highway'
		},
		{
			id: 'studio-postcards-2021-04-29-upper-limit',
			date: '2021-04-29',
			area: 'studio',
			category: 'postcards',
			action: 'edited',
			title: 'Upper Limit',
			href: '/studio/postcards/upper-limit'
		},
		{
			id: 'studio-postcards-2021-03-16-factory',
			date: '2021-03-16',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Factory',
			href: '/studio/postcards/factory'
		},
		{
			id: 'studio-postcards-2020-02-09-the-goat-hunters',
			date: '2020-02-09',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'The Goat Hunters',
			href: '/studio/postcards/the-goat-hunters'
		},
		{
			id: 'studio-postcards-2018-09-13-good-neighbor',
			date: '2018-09-13',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Good Neighbor',
			href: '/studio/postcards/good-neighbor'
		},
		{
			id: 'studio-postcards-2018-04-04-afterlife',
			date: '2018-04-04',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Afterlife',
			href: '/studio/postcards/afterlife'
		},
		{
			id: 'studio-postcards-2018-02-18-fits',
			date: '2018-02-18',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Fits',
			href: '/studio/postcards/fits'
		},
		{
			id: 'studio-postcards-2018-02-03-upper-limit',
			date: '2018-02-03',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Upper Limit',
			href: '/studio/postcards/upper-limit'
		},
		{
			id: 'studio-postcards-2018-01-20-the-tinker',
			date: '2018-01-20',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'The Tinker',
			href: '/studio/postcards/the-tinker'
		},
		{
			id: 'studio-postcards-2018-01-13-highway',
			date: '2018-01-13',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Highway',
			href: '/studio/postcards/highway'
		},
		{
			id: 'studio-postcards-2012-11-12-old-caboose',
			date: '2012-11-12',
			area: 'studio',
			category: 'postcards',
			action: 'added',
			title: 'Old Caboose',
			href: '/studio/postcards/old-caboose'
		},
		{
			id: 'studio-hfc-2025-12-23-portrait-of-the-body-as-a-failed-industry',
			date: '2025-12-23',
			area: 'studio',
			category: 'hfc',
			action: 'edited',
			title: 'portrait of the body as a failed industry',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2025-12-11-a-reminder-to-breathe',
			date: '2025-12-11',
			area: 'studio',
			category: 'hfc',
			action: 'edited',
			title: 'a reminder to breathe',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2025-11-21-the-death-of-baldur',
			date: '2025-11-21',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'the death of baldur',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2025-11-19-portrait-of-the-body-as-a-failed-industry',
			date: '2025-11-19',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'portrait of the body as a failed industry',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2025-07-27-twelve-hymns-for-calliope',
			date: '2025-07-27',
			area: 'studio',
			category: 'hfc',
			action: 'edited',
			title: 'twelve hymns for calliope',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2023-04-02-i-used-to-think-the-roots-of-all-the-corn-on-earth',
			date: '2023-04-02',
			area: 'studio',
			category: 'hfc',
			action: 'edited',
			title: 'i used to think the roots of all the corn on earth',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2023-03-26-a-reminder-to-breathe',
			date: '2023-03-26',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'a reminder to breathe',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2021-08-25-pyriscence',
			date: '2021-08-25',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'pyriscence',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2021-07-29-dimensions-zero-to-five',
			date: '2021-07-29',
			area: 'studio',
			category: 'hfc',
			action: 'edited',
			title: 'dimensions zero to five',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2018-12-04-paradise-ablaze',
			date: '2018-12-04',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'paradise ablaze',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2018-10-12-ornithonyssus-bacoti',
			date: '2018-10-12',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'ornithonyssus bacoti',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2018-06-13-twelve-hymns-for-calliope',
			date: '2018-06-13',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'twelve hymns for calliope',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-12-10-demodex-folliculorum-36-balloons',
			date: '2017-12-10',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'demodex folliculorum (36 balloons)',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-11-12-dimensions-zero-to-five',
			date: '2017-11-12',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'dimensions zero to five',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-10-04-dehiscence',
			date: '2017-10-04',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'dehiscence',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-10-01-dear-mr-barker',
			date: '2017-10-01',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'dear Mr. Barker',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-09-20-i-used-to-think-the-roots-of-all-the-corn-on-earth',
			date: '2017-09-20',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'i used to think the roots of all the corn on earth',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2017-08-21-on-watching-another-family-watch-the-solar-eclipse',
			date: '2017-08-21',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'on watching another family watch the solar eclipse',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2016-12-20-a-working-theory-of-moving',
			date: '2016-12-20',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'a working theory of moving',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2014-03-13-cymothoa-exigua',
			date: '2014-03-13',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'cymothoa exigua',
			href: '/studio/hfc'
		},
		{
			id: 'studio-hfc-2013-10-15-friction',
			date: '2013-10-15',
			area: 'studio',
			category: 'hfc',
			action: 'added',
			title: 'friction',
			href: '/studio/hfc'
		}
	] satisfies NewsEntry[]
).sort((a, b) => b.date.localeCompare(a.date));
