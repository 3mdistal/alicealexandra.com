import { defineEnvVars } from '@sveltejs/kit/env';

// Server-only and read at runtime, like `$env/dynamic/private` before. Each one may be missing:
// the code that reads it handles that.
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
