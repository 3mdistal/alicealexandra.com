import { LLMS_TEXT } from '$lib/server/agent-readiness';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(LLMS_TEXT, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
