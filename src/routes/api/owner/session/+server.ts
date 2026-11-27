import { json, type RequestHandler } from '@sveltejs/kit';
import { getBlogPublishStatus } from '#lib/server/blog-publishing.ts';
import { isOwnerAuthConfigured } from '#lib/server/owner-session.ts';

export const GET: RequestHandler = ({ locals }) => {
	const publishStatus = getBlogPublishStatus();

	return json({
		isOwner: locals.isOwner,
		owner: locals.owner,
		authConfigured: isOwnerAuthConfigured(),
		publishConfigured: publishStatus.contentRepoConfigured
	});
};
