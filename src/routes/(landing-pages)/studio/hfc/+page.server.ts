import {
	loadSections,
	loadAllPoems,
	transformSectionsToNotionFormat,
	type Poem
} from '$lib/content/poems';

// Prerender this page at build time - no runtime file access needed
export const prerender = true;

export async function load() {
	try {
		const [sections, poems] = await Promise.all([loadSections(), loadAllPoems()]);

		// Transform poems to Notion format AND include content
		const poemsWithContent = {
			results: poems.map((poem: Poem) => ({
				id: poem.id,
				content: poem.content, // Include the actual content
				properties: {
					Name: {
						type: 'title' as const,
						title: [{ plain_text: poem.title }]
					},
					sectionName: {
						type: 'formula' as const,
						formula: { string: poem.sectionName }
					},
					NotLineated: {
						type: 'checkbox' as const,
						checkbox: poem.notLineated
					}
				}
			}))
		};

		return {
			props: {
				sections: transformSectionsToNotionFormat(sections),
				poems: poemsWithContent
			}
		};
	} catch (error) {
		// Re-throw during build so we see the actual error
		throw error;
	}
}
