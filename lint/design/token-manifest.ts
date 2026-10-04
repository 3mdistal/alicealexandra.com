import { readFileSync, statSync } from 'node:fs';
import postcss, { type Node } from 'postcss';
import { parseColor, type Rgba } from './color.ts';
import { samePath } from './settings.ts';

/** One definition of a custom property in a token file. */
export interface TokenDefinition {
	name: string;
	value: string;
	file: string;
	line: number;
	/** Selectors and at-rules around the definition, outermost first, such as `['@media (prefers-color-scheme: dark)', ':root']`. */
	context: string[];
}

/**
 * Every token the design system defines. A name can have several definitions: one per route theme,
 * color scheme, or breakpoint.
 */
export interface TokenManifest {
	definitions: Map<string, TokenDefinition[]>;
}

export function parseTokenFile(file: string, css: string): TokenDefinition[] {
	const definitions: TokenDefinition[] = [];
	postcss.parse(css, { from: file }).walkDecls((declaration) => {
		if (!declaration.prop.startsWith('--')) return;
		definitions.push({
			name: declaration.prop,
			value: declaration.value,
			file,
			line: declaration.source?.start?.line ?? 0,
			context: contextOf(declaration)
		});
	});
	return definitions;
}

/** The selectors and at-rules around a PostCSS node, outermost first. */
export function contextOf(node: Node): string[] {
	const context: string[] = [];
	for (let parent = node.parent; parent; parent = parent.parent) {
		if (parent.type === 'rule' && 'selector' in parent) {
			context.unshift(String(parent.selector));
		} else if (parent.type === 'atrule' && 'name' in parent && 'params' in parent) {
			context.unshift(`@${String(parent.name)} ${String(parent.params)}`);
		}
	}
	return context;
}

/** A primitive color token, such as `--color-sky-500` and its parsed value. */
export interface ColorPrimitive {
	name: string;
	color: Rgba;
}

/** The tokens defined in the primitives file, and which of them are colors. */
export function primitivesIn(
	definitions: TokenManifest['definitions'],
	primitivesFile: string
): { all: string[]; colors: ColorPrimitive[] } {
	const all: string[] = [];
	const colors: ColorPrimitive[] = [];
	for (const [name, list] of definitions) {
		const primitive = list.find((definition) => samePath(definition.file, primitivesFile));
		if (!primitive) continue;
		all.push(name);
		const color = parseColor(primitive.value);
		if (color) colors.push({ name, color });
	}
	return { all, colors };
}

const cache = new Map<string, { stamp: string; manifest: TokenManifest }>();

/** Reads the token files, reusing the last result until one of them changes on disk. */
export function loadTokenManifest(files: readonly string[]): TokenManifest {
	const key = files.join('\n');
	const stamp = files.map(modifiedTime).join(',');
	const cached = cache.get(key);
	if (cached?.stamp === stamp) return cached.manifest;

	const definitions = new Map<string, TokenDefinition[]>();
	for (const file of files) {
		for (const definition of parseTokenFile(file, readFileSync(file, 'utf8'))) {
			const existing = definitions.get(definition.name);
			if (existing) existing.push(definition);
			else definitions.set(definition.name, [definition]);
		}
	}

	const manifest = { definitions };
	cache.set(key, { stamp, manifest });
	return manifest;
}

function modifiedTime(file: string): number {
	try {
		return statSync(file).mtimeMs;
	} catch {
		throw new Error(
			`Token file not found: ${file}. Check \`settings.design.tokenFiles\` in eslint.config.js.`
		);
	}
}
