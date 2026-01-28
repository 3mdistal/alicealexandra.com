import { redirect } from '@sveltejs/kit';

export function load() {
	throw redirect(301, '/career/builder');
}

export const prerender = true;
