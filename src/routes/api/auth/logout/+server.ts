import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearOwnerSession, sanitizeRedirectTo } from '$lib/server/owner-session';

export const GET: RequestHandler = ({ cookies, url }) => {
	clearOwnerSession(cookies);
	throw redirect(302, sanitizeRedirectTo(url.searchParams.get('redirectTo')));
};
