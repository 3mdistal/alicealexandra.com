import type { Rule } from 'eslint';
import { designSettings } from '../settings.ts';
import { visitStyles } from '../style-source.ts';
import { suggestTokens } from '../suggest.ts';
import { loadTokenManifest } from '../token-manifest.ts';
import { findVarReferences } from '../var-references.ts';

/**
 * CSS ignores a `var()` that names an undefined custom property: the property quietly resets to its
 * inherited or initial value. This rule makes that an error.
 *
 * `var(--x)` must name a token from the token files or a custom property this file sets itself.
 * `var(--x, fallback)` is always allowed, because the fallback marks `--x` as an input a parent may set.
 */
const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require every `var()` without a fallback to name a defined custom property'
		},
		messages: {
			unknownToken:
				"`{{name}}` isn't defined in a token file or in this file, so the property silently resets to its inherited or initial value.{{suggestion}} If a parent component sets it, give it a fallback: `var({{name}}, …)`."
		},
		schema: []
	},

	create(context) {
		const { definitions } = loadTokenManifest(designSettings(context).tokenFiles);

		return visitStyles(context, ({ declarations, localDefinitions }) => {
			for (const { value, valueStart } of declarations) {
				for (const reference of findVarReferences(value)) {
					const { name } = reference;
					if (reference.hasFallback || definitions.has(name) || localDefinitions.has(name))
						continue;
					const suggestion = suggestTokens(name, [...definitions.keys(), ...localDefinitions]);
					context.report({
						loc: {
							start: context.sourceCode.getLocFromIndex(valueStart + reference.start),
							end: context.sourceCode.getLocFromIndex(valueStart + reference.end)
						},
						messageId: 'unknownToken',
						data: { name, suggestion: suggestion ? ` ${suggestion}` : '' }
					});
				}
			}
		});
	}
};

export default rule;
