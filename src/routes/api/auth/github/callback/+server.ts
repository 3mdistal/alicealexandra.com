import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import {
	clearOwnerSession,
	getOwnerAuthConfiguration,
	isAllowedOwner,
	readOwnerOAuthState,
	setOwnerSession
} from '$lib/server/owner-session';

interface GitHubAccessTokenResponse {
	access_token?: string;
	error?: string;
	error_description?: string;
}

interface GitHubUserResponse {
	login: string;
	id: number;
	name?: string | null;
	avatar_url?: string | null;
}

export const GET: RequestHandler = async ({ cookies, fetch, url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		throw error(400, 'Missing GitHub OAuth callback parameters.');
	}

	const statePayload = readOwnerOAuthState(cookies, state);
	if (!statePayload) {
		clearOwnerSession(cookies);
		throw redirect(302, '/owner?error=invalid-state');
	}

	const config = getOwnerAuthConfiguration();
	const callbackUrl = new URL('/api/auth/github/callback', url.origin);
	const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			code,
			redirect_uri: callbackUrl.toString(),
			state
		})
	});

	const tokenData = (await tokenResponse.json()) as GitHubAccessTokenResponse;
	if (!tokenResponse.ok || !tokenData.access_token) {
		throw redirect(
			302,
			`/owner?error=${encodeURIComponent(tokenData.error ?? 'token-exchange-failed')}`
		);
	}

	const userResponse = await fetch('https://api.github.com/user', {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${tokenData.access_token}`,
			'User-Agent': 'alicealexandra-owner-editor'
		}
	});

	if (!userResponse.ok) {
		throw redirect(302, '/owner?error=github-user-fetch-failed');
	}

	const user = (await userResponse.json()) as GitHubUserResponse;
	if (!isAllowedOwner(user)) {
		clearOwnerSession(cookies);
		throw redirect(302, '/owner?error=owner-not-authorized');
	}

	setOwnerSession(cookies, user);
	throw redirect(302, statePayload.redirectTo);
};
