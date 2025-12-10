import {
	loadSections,
	loadPoemsMeta,
	transformSectionsToNotionFormat,
	transformPoemsToNotionFormat
} from '$lib/content/poems';
import { BYPASS_TOKEN } from '$env/static/private';

export async function load() {
	try {
		const [sections, poems] = await Promise.all([loadSections(), loadPoemsMeta()]);

		return {
			props: {
				sections: transformSectionsToNotionFormat(sections),
				poems: transformPoemsToNotionFormat(poems)
			}
		};
	} catch (error) {
		console.warn(
			'Failed to load HFC content from local files:',
			error instanceof Error ? error.message : error
		);
		// Return empty arrays as fallback
		return {
			props: {
				sections: { results: [] },
				poems: { results: [] }
			}
		};
	}
}

export const config = {
	isr: {
		expiration: false,
		bypassToken: BYPASS_TOKEN
	},
	runtime: 'nodejs20.x'
};
