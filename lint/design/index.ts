/**
 * The site's own ESLint plugin for keeping styles inside the design system. Its rules read the
 * token files named in `settings.design.tokenFiles` (`primitivesFile` is the one holding raw values)
 * and check `.svelte` style blocks and `.css` files.
 */
import noRawColor from './rules/no-raw-color.ts';
import noUnknownToken from './rules/no-unknown-token.ts';
import tokenTiers from './rules/token-tiers.ts';

export default {
	meta: { name: 'design' },
	rules: {
		'no-raw-color': noRawColor,
		'no-unknown-token': noUnknownToken,
		'token-tiers': tokenTiers
	}
};
