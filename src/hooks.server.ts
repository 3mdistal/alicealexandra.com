import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { HOMEPAGE_MARKDOWN } from '$lib/server/agent-readiness';
import { selectHomepageRepresentation } from '$lib/server/content-negotiation';
import { readOwnerSession } from '$lib/server/owner-session';

// Permanent redirects for old blog post slugs that no longer exist as
// prerendered entries, so they can still 301 instead of 404ing.
const BLOG_SLUG_REDIRECTS: Record<string, string> = {
	'thinking-in-quantum': 'the-shady-side-of-the-hill'
};

export const handle: Handle = async ({ event, resolve }) => {
	const owner = readOwnerSession(event.cookies);
	event.locals.owner = owner;
	event.locals.isOwner = Boolean(owner);

	const oldBlogSlug = event.url.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1];
	const redirectSlug = oldBlogSlug ? BLOG_SLUG_REDIRECTS[oldBlogSlug] : undefined;
	if (redirectSlug) {
		redirect(301, `/blog/${redirectSlug}`);
	}

	if (
		event.url.pathname !== '/' ||
		(event.request.method !== 'GET' && event.request.method !== 'HEAD')
	) {
		return resolve(event);
	}

	const representation = selectHomepageRepresentation(event.request.headers.get('accept'));
	if (!representation) {
		return new Response('Not Acceptable\n', {
			status: 406,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				Vary: 'Accept'
			}
		});
	}

	if (representation === 'text/markdown') {
		return new Response(event.request.method === 'HEAD' ? null : HOMEPAGE_MARKDOWN, {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				Vary: 'Accept'
			}
		});
	}

	const response = await resolve(event);
	response.headers.append('Vary', 'Accept');
	return response;
};
