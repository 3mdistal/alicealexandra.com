import { loadTallTalesMeta } from '$lib/content/tall-tales';

export const prerender = true;

export async function load() {
	const tales = await loadTallTalesMeta();
	return { tales };
}
