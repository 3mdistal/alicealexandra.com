import type { Rule } from 'eslint';
import { resolve } from 'node:path';

/** Shared settings for every `design/*` rule, set once in `eslint.config.js`. */
export interface DesignSettings {
	/** Absolute paths of the CSS files that define the design tokens. */
	tokenFiles: string[];
	/** The token file that holds the primitives, the raw values every other token refers to. */
	primitivesFile: string | undefined;
}

export function designSettings(context: Rule.RuleContext): DesignSettings {
	const settings = context.settings['design'] as Partial<DesignSettings> | undefined;
	const tokenFiles = settings?.tokenFiles;
	if (!Array.isArray(tokenFiles) || tokenFiles.length === 0) {
		throw new Error('design rules need `settings.design.tokenFiles` in eslint.config.js.');
	}
	const primitivesFile = settings?.primitivesFile;
	if (primitivesFile !== undefined && !tokenFiles.some((file) => samePath(file, primitivesFile))) {
		throw new Error(
			'`settings.design.primitivesFile` must be one of `settings.design.tokenFiles` in eslint.config.js.'
		);
	}
	return { tokenFiles, primitivesFile };
}

/** Compares paths the way the file system does, ignoring slash direction and, on Windows, case. */
export function samePath(a: string, b: string): boolean {
	const normalize = (path: string) =>
		process.platform === 'win32' ? resolve(path).toLowerCase() : resolve(path);
	return normalize(a) === normalize(b);
}
