import { json } from '@sveltejs/kit';
import { fetchBuilderPostsLive } from '$lib/content/builder';

export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	const posts = await fetchBuilderPostsLive();
	return json(posts);
}
