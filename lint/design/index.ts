/**
 * The site's own ESLint plugin for keeping styles inside the design system. Its rules read the
 * token files named in `settings.design.tokenFiles` and check `.svelte` style blocks and `.css` files.
 */
import noUnknownToken from './rules/no-unknown-token.ts';

export default {
	meta: { name: 'design' },
	rules: {
		'no-unknown-token': noUnknownToken
	}
};
