import { loadIllustrations } from '$lib/content/studio';

export async function load() {
	const illustrations = await loadIllustrations();
	return { illustrations };
}

export const prerender = true;
