import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, BLOGS_DB } from '$env/static/private';
import type {
	QueryDatabaseParameters,
	PageObjectResponse,
	RichTextPropertyItemObjectResponse,
	RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints';
// Import the notion client directly to fetch properties
import { notionClient } from '$lib/notion/api/client';

const today = new Date(Date.now()).toISOString();

const queryParams: QueryDatabaseParameters = {
	database_id: BLOGS_DB,
	filter: {
		and: [
			{
				property: 'Publication Date',
				date: {
					on_or_before: today
				}
			},
		]
	},
	sorts: [
		{
			direction: 'descending',
			property: 'Publication Date'
		}
	]
};

// Helper to safely retrieve a property's rich text array
async function retrieveRichTextProperty(
	pageId: string,
	propertyId: string | undefined
): Promise<Array<RichTextItemResponse> | null> {
	if (typeof propertyId !== 'string' || propertyId.length === 0) {
		return null;
	}
	try {
		const property = (await notionClient.pages.properties.retrieve({
			page_id: pageId,
			property_id: propertyId
		})) as RichTextPropertyItemObjectResponse;

		// Explicitly check the type and assign to a correctly typed variable
		let richTextContent: Array<RichTextItemResponse> | null = null;
		if (property?.type === 'rich_text') {
			richTextContent = property.rich_text;
		}

		return richTextContent;

	} catch (error) {
		console.error(`Failed to fetch property ${propertyId} for page ${pageId}:`, error);
		return null;
	}
}

export async function load() {
	// Fetch the initial list of pages (metadata only)
	const initialResponse = await queryDatabase(queryParams);

	// Find the first result that is a proper PageObjectResponse
	const firstPageResult = initialResponse.results.find(
		(result): result is PageObjectResponse => 'properties' in result
	);

	// Log all properties of the first page result
	console.log('First Page Properties (Server):', firstPageResult?.properties);

	// Get IDs for both Summary and Subtitle
	const summaryPropertyId = firstPageResult?.properties?.['Summary']?.id;
	const subtitlePropertyId = firstPageResult?.properties?.['Subtitle']?.id;
	console.log('Extracted Summary ID:', summaryPropertyId);
	console.log('Extracted Subtitle ID:', subtitlePropertyId);

	// Fetch and enrich results
	const enrichedResults = await Promise.all(
		initialResponse.results
			.filter((result): result is PageObjectResponse => 'properties' in result)
			.map(async (page) => {
				// Fetch both properties concurrently
				const [summaryRichText, subtitleRichText] = await Promise.all([
					retrieveRichTextProperty(page.id, summaryPropertyId),
					retrieveRichTextProperty(page.id, subtitlePropertyId)
				]);

				// Create new properties object, merging only if fetch was successful
				const newProperties = { ...page.properties };
				if (summaryRichText) {
					newProperties['Summary'] = { rich_text: summaryRichText } as any; // Cast needed for simplified structure
				}
				if (subtitleRichText) {
					newProperties['Subtitle'] = { rich_text: subtitleRichText } as any; // Cast needed
				}

				return {
					...page,
					properties: newProperties
				};
			})
	);

	// Log the final structure for the first enriched result
	const firstEnrichedResult = enrichedResults[0];
	console.log(
		'Final Enriched Summary (Server):',
		firstEnrichedResult?.properties?.['Summary']
	);
	console.log(
		'Final Enriched Subtitle (Server):',
		firstEnrichedResult?.properties?.['Subtitle']
	);

	return {
		// Return the enriched results to the page component
		post: {
			...initialResponse,
			results: enrichedResults
		}
	};
}

export const config = {
	isr: {
		expiration: false,
		bypassToken: BYPASS_TOKEN
	},
	runtime: 'nodejs20.x'
};
