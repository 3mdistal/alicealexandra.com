import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// Allowed routes for revalidation to prevent abuse
const ALLOWED_ROUTES = [
	'/studio',
	'/blog',
	'/studio/hfc',
	'/studio/postcards',
	'/studio/illustrations',
	'/vercel'
];

export const POST: RequestHandler = async ({ request, url, fetch: serverFetch }) => {
	try {
		const { route } = await request.json();

		if (!route) {
			throw error(400, 'Route parameter is required');
		}

		// Validate that the route is in our allowed list
		const isAllowedRoute = ALLOWED_ROUTES.some(
			(allowedRoute) => route === allowedRoute || route.startsWith(`${allowedRoute}/`)
		);

		if (!isAllowedRoute) {
			throw error(403, `Route '${route}' is not allowed for revalidation`);
		}

		const bypassToken = env['BYPASS_TOKEN'];
		if (!bypassToken) {
			throw error(500, 'Missing required BYPASS_TOKEN environment variable');
		}

		// Construct the full URL for the route
		const targetUrl = new URL(route, url.origin);

		// Send revalidation request with bypass token
		const response = await serverFetch(targetUrl, {
			method: 'HEAD',
			headers: {
				'x-prerender-revalidate': bypassToken
			}
		});

		if (response.ok) {
			return json({
				success: true,
				route,
				revalidated: true,
				timestamp: new Date().toISOString()
			});
		} else {
			throw error(
				500,
				`Failed to revalidate route '${route}': ${response.status} ${response.statusText}`
			);
		}
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Revalidation error:', err);
		throw error(500, 'Internal server error during revalidation');
	}
};

// Also support GET requests for simple revalidation triggers
export const GET: RequestHandler = async ({ url, fetch: serverFetch }) => {
	const route = url.searchParams.get('route');

	if (!route) {
		throw error(400, 'Route query parameter is required');
	}

	// Use the same logic as POST
	return POST({
		request: new Request(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ route })
		}),
		url,
		fetch: serverFetch
	} as any);
};
