import { loadBuilderSnapshot, type BuilderSnapshot } from '$lib/content/builder';

export async function load() {
	const snapshot = await loadBuilderSnapshot();
	return { snapshot };
}

export const prerender = true;

export type { BuilderSnapshot };
