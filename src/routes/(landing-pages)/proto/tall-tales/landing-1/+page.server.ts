import { loadTallTalesMeta } from '$lib/content/tall-tales.server';

export const prerender = true;

export async function load() {
	const tales = await loadTallTalesMeta();
	return { tales };
}
