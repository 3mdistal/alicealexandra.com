import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const OWNER_SESSION_COOKIE = 'owner_session';
const OWNER_STATE_COOKIE = 'owner_oauth_state';
const OWNER_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const OWNER_STATE_MAX_AGE = 60 * 10;

type OwnerTokenPayload = {
	login: string;
	id: number;
	name: string | null;
	avatarUrl: string | null;
	expiresAt: number;
};

type OAuthStatePayload = {
	redirectTo: string;
	nonce: string;
	expiresAt: number;
};

export interface OwnerSession {
	login: string;
	id: number;
	name: string | null;
	avatarUrl: string | null;
	expiresAt: number;
}

export interface GitHubOwnerProfile {
	login: string;
	id: number;
	name?: string | null;
	avatar_url?: string | null;
}

function getCookieOptions(maxAge: number) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: !dev,
		maxAge
	};
}

function base64UrlEncode(value: string): string {
	return Buffer.from(value, 'utf-8').toString('base64url');
}

function base64UrlDecode(value: string): string {
	return Buffer.from(value, 'base64url').toString('utf-8');
}

function getOwnerSessionSecret(): string | null {
	return env['OWNER_SESSION_SECRET']?.trim() || null;
}

function signValue(value: string, secret: string): string {
	return createHmac('sha256', secret).update(value).digest('base64url');
}

function createSignedToken<T extends Record<string, unknown>>(payload: T, secret: string): string {
	const encodedPayload = base64UrlEncode(JSON.stringify(payload));
	return `${encodedPayload}.${signValue(encodedPayload, secret)}`;
}

function readSignedToken<T extends { expiresAt: number }>(token: string, secret: string): T | null {
	const [encodedPayload, signature] = token.split('.');
	if (!encodedPayload || !signature) {
		return null;
	}

	const expectedSignature = signValue(encodedPayload, secret);
	const receivedSignature = Buffer.from(signature);
	const calculatedSignature = Buffer.from(expectedSignature);

	if (
		receivedSignature.length !== calculatedSignature.length ||
		!timingSafeEqual(receivedSignature, calculatedSignature)
	) {
		return null;
	}

	try {
		const payload = JSON.parse(base64UrlDecode(encodedPayload)) as T;
		if (payload.expiresAt <= Date.now()) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}

export function getOwnerAuthConfiguration() {
	return {
		clientId: env['GITHUB_OAUTH_CLIENT_ID']?.trim() || '',
		clientSecret: env['GITHUB_OAUTH_CLIENT_SECRET']?.trim() || '',
		allowedLogin: env['OWNER_GITHUB_LOGIN']?.trim() || '',
		allowedId: env['OWNER_GITHUB_ID']?.trim() || ''
	};
}

export function isOwnerAuthConfigured(): boolean {
	const config = getOwnerAuthConfiguration();
	return Boolean(
		config.clientId &&
		config.clientSecret &&
		(config.allowedLogin || config.allowedId) &&
		getOwnerSessionSecret()
	);
}

export function createOwnerOAuthState(redirectTo: string): string {
	const secret = getOwnerSessionSecret();
	if (!secret) {
		throw new Error('OWNER_SESSION_SECRET is not configured');
	}

	const payload: OAuthStatePayload = {
		redirectTo: sanitizeRedirectTo(redirectTo),
		nonce: randomBytes(16).toString('hex'),
		expiresAt: Date.now() + OWNER_STATE_MAX_AGE * 1000
	};

	return createSignedToken(payload, secret);
}

export function storeOwnerOAuthState(cookies: Cookies, state: string): void {
	cookies.set(OWNER_STATE_COOKIE, state, getCookieOptions(OWNER_STATE_MAX_AGE));
}

export function readOwnerOAuthState(cookies: Cookies, state: string): OAuthStatePayload | null {
	const secret = getOwnerSessionSecret();
	const cookieState = cookies.get(OWNER_STATE_COOKIE);
	cookies.delete(OWNER_STATE_COOKIE, { path: '/' });

	if (!secret || !cookieState || cookieState !== state) {
		return null;
	}

	return readSignedToken<OAuthStatePayload>(state, secret);
}

export function createOwnerSessionToken(profile: GitHubOwnerProfile): string {
	const secret = getOwnerSessionSecret();
	if (!secret) {
		throw new Error('OWNER_SESSION_SECRET is not configured');
	}

	return createSignedToken<OwnerTokenPayload>(
		{
			login: profile.login,
			id: profile.id,
			name: profile.name ?? null,
			avatarUrl: profile.avatar_url ?? null,
			expiresAt: Date.now() + OWNER_SESSION_MAX_AGE * 1000
		},
		secret
	);
}

export function setOwnerSession(cookies: Cookies, profile: GitHubOwnerProfile): void {
	cookies.set(
		OWNER_SESSION_COOKIE,
		createOwnerSessionToken(profile),
		getCookieOptions(OWNER_SESSION_MAX_AGE)
	);
}

export function clearOwnerSession(cookies: Cookies): void {
	cookies.delete(OWNER_SESSION_COOKIE, { path: '/' });
	cookies.delete(OWNER_STATE_COOKIE, { path: '/' });
}

export function readOwnerSession(cookies: Cookies): OwnerSession | null {
	const secret = getOwnerSessionSecret();
	const token = cookies.get(OWNER_SESSION_COOKIE);
	if (!secret || !token) {
		return null;
	}

	const payload = readSignedToken<OwnerTokenPayload>(token, secret);
	if (!payload) {
		return null;
	}

	return {
		login: payload.login,
		id: payload.id,
		name: payload.name,
		avatarUrl: payload.avatarUrl,
		expiresAt: payload.expiresAt
	};
}

export function isAllowedOwner(profile: GitHubOwnerProfile): boolean {
	const { allowedLogin, allowedId } = getOwnerAuthConfiguration();
	const normalizedLogin = allowedLogin.toLowerCase();
	const normalizedAllowedId = allowedId ? Number(allowedId) : null;

	if (normalizedLogin && profile.login.toLowerCase() !== normalizedLogin) {
		return false;
	}

	if (normalizedAllowedId && profile.id !== normalizedAllowedId) {
		return false;
	}

	return Boolean(normalizedLogin || normalizedAllowedId);
}

export function sanitizeRedirectTo(redirectTo: string | null | undefined): string {
	if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
		return '/owner';
	}

	return redirectTo;
}
