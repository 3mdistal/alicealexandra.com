import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review dynamic environment variables. They accept missing values (`undefined`), add stricter validation where a value is required.
export const variables = defineEnvVars({
	BYPASS_TOKEN: { schema: (input) => input },
	CONTENT_REPO_OWNER: { schema: (input) => input },
	CONTENT_REPO_NAME: { schema: (input) => input },
	CONTENT_REPO_BRANCH: { schema: (input) => input },
	GITHUB_WRITE_TOKEN: { schema: (input) => input },
	GITHUB_TOKEN: { schema: (input) => input },
	OWNER_SESSION_SECRET: { schema: (input) => input },
	GITHUB_OAUTH_CLIENT_ID: { schema: (input) => input },
	GITHUB_OAUTH_CLIENT_SECRET: { schema: (input) => input },
	OWNER_GITHUB_LOGIN: { schema: (input) => input },
	OWNER_GITHUB_ID: { schema: (input) => input }
});
