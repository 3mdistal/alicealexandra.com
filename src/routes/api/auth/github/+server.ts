import { redirect, type RequestHandler } from '@sveltejs/kit';
import {
	createOwnerOAuthState,
	getOwnerAuthConfiguration,
	isOwnerAuthConfigured,
	sanitizeRedirectTo,
	storeOwnerOAuthState
} from '$lib/server/owner-session';

export const GET: RequestHandler = ({ cookies, url }) => {
	if (!isOwnerAuthConfigured()) {
		throw redirect(302, '/owner?error=auth-not-configured');
	}

	const config = getOwnerAuthConfiguration();
	const redirectTo = sanitizeRedirectTo(url.searchParams.get('redirectTo'));
	const state = createOwnerOAuthState(redirectTo);
	const callbackUrl = new URL('/api/auth/github/callback', url.origin);
	const githubAuthorizeUrl = new URL('https://github.com/login/oauth/authorize');
	githubAuthorizeUrl.searchParams.set('client_id', config.clientId);
	githubAuthorizeUrl.searchParams.set('redirect_uri', callbackUrl.toString());
	githubAuthorizeUrl.searchParams.set('scope', 'read:user');
	githubAuthorizeUrl.searchParams.set('state', state);

	storeOwnerOAuthState(cookies, state);
	throw redirect(302, githubAuthorizeUrl.toString());
};
