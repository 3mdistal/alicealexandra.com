import { json } from '@sveltejs/kit';
import { fetchBuilderPostsLive, loadBuilderSnapshot } from '$lib/content/builder';

export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	// Try live RSS first; fall back to the static snapshot if it returns nothing.
	const livePosts = await fetchBuilderPostsLive();
	if (livePosts.length > 0) {
		return json(livePosts);
	}

	const snapshot = await loadBuilderSnapshot();
	return json(snapshot.data);
}
