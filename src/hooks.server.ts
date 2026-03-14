import type { Handle } from '@sveltejs/kit';
import { readOwnerSession } from '$lib/server/owner-session';

export const handle: Handle = async ({ event, resolve }) => {
	const owner = readOwnerSession(event.cookies);
	event.locals.owner = owner;
	event.locals.isOwner = Boolean(owner);

	return resolve(event);
};
