export type HomepageRepresentation = 'text/html' | 'text/markdown';

interface AcceptRange {
	type: string;
	subtype: string;
	quality: number;
	index: number;
}

interface RepresentationScore {
	representation: HomepageRepresentation;
	quality: number;
	specificity: number;
	index: number;
}

const DEFAULT_REPRESENTATION: HomepageRepresentation = 'text/html';
const SUPPORTED_REPRESENTATIONS: HomepageRepresentation[] = ['text/html', 'text/markdown'];

function parseQuality(parameters: string[]): number {
	const qualityParameter = parameters.find((parameter) => parameter.toLowerCase().startsWith('q='));
	if (!qualityParameter) return 1;

	const quality = Number(qualityParameter.slice(2).trim());
	return Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0;
}

function parseAccept(header: string): AcceptRange[] {
	return header
		.split(',')
		.map((rawRange, index) => {
			const [mediaRange = '', ...parameters] = rawRange.split(';').map((part) => part.trim());
			const [type = '', subtype = ''] = mediaRange.toLowerCase().split('/');
			if (!type || !subtype || (type === '*' && subtype !== '*')) return null;

			return {
				type,
				subtype,
				quality: parseQuality(parameters),
				index
			};
		})
		.filter((range): range is AcceptRange => range !== null);
}

function scoreRepresentation(
	representation: HomepageRepresentation,
	ranges: AcceptRange[]
): RepresentationScore | null {
	const [type, subtype] = representation.split('/');
	const matches = ranges
		.map((range) => {
			if (range.type === type && range.subtype === subtype) return { range, specificity: 2 };
			if (range.type === type && range.subtype === '*') return { range, specificity: 1 };
			if (range.type === '*' && range.subtype === '*') return { range, specificity: 0 };
			return null;
		})
		.filter((match): match is { range: AcceptRange; specificity: number } => match !== null)
		.sort((a, b) => b.specificity - a.specificity || a.range.index - b.range.index);

	const match = matches[0];
	if (!match || match.range.quality === 0) return null;

	return {
		representation,
		quality: match.range.quality,
		specificity: match.specificity,
		index: match.range.index
	};
}

export function selectHomepageRepresentation(
	acceptHeader: string | null
): HomepageRepresentation | null {
	if (!acceptHeader?.trim()) return DEFAULT_REPRESENTATION;

	const ranges = parseAccept(acceptHeader);
	if (ranges.length === 0) return null;

	const scores = SUPPORTED_REPRESENTATIONS.map((representation) =>
		scoreRepresentation(representation, ranges)
	)
		.filter((score): score is RepresentationScore => score !== null)
		.sort(
			(a, b) =>
				b.quality - a.quality ||
				b.specificity - a.specificity ||
				a.index - b.index ||
				SUPPORTED_REPRESENTATIONS.indexOf(a.representation) -
					SUPPORTED_REPRESENTATIONS.indexOf(b.representation)
		);

	return scores[0]?.representation ?? null;
}
