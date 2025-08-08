import { json } from '@sveltejs/kit';
import { BYPASS_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	// Check if the request has the correct bypass token for revalidation
	const revalidateToken = request.headers.get('x-prerender-revalidate');
	
	if (revalidateToken === BYPASS_TOKEN) {
		// Return success response for valid revalidation requests
		return json({ 
			message: 'Revalidation triggered successfully',
			timestamp: new Date().toISOString()
		}, { 
			status: 200 
		});
	}
	
	// For requests without valid bypass token, return basic success
	return json({ 
		message: 'Studio endpoint accessed',
		timestamp: new Date().toISOString()
	}, { 
		status: 200 
	});
};
