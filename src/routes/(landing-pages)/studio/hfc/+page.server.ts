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
		console.log('[HFC] Loading content from:', process.cwd());
		const [sections, poems] = await Promise.all([loadSections(), loadAllPoems()]);
		console.log('[HFC] Loaded', sections.length, 'sections and', poems.length, 'poems');

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
		console.error('[HFC] Failed to load content:', error);
		console.error('[HFC] CWD:', process.cwd());
		// Re-throw during build so we see the actual error
		throw error;
	}
}
