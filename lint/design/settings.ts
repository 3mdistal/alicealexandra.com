import type { Rule } from 'eslint';

/** Shared settings for every `design/*` rule, set once in `eslint.config.js`. */
export interface DesignSettings {
	/** Absolute paths of the CSS files that define the design tokens. */
	tokenFiles: string[];
}

export function designSettings(context: Rule.RuleContext): DesignSettings {
	const settings = context.settings['design'] as Partial<DesignSettings> | undefined;
	const tokenFiles = settings?.tokenFiles;
	if (!Array.isArray(tokenFiles) || tokenFiles.length === 0) {
		throw new Error('design rules need `settings.design.tokenFiles` in eslint.config.js.');
	}
	return { tokenFiles };
}
