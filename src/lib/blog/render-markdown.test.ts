import { describe, expect, it } from 'vitest';
import { renderBlogMarkdown } from './render-markdown';

const interlude = [
	'Before the video.',
	'',
	'<video class="session-interlude-video" loop muted playsinline preload="metadata">',
	'\t<source src="https://example.com/interlude.mp4" type="video/mp4" />',
	'\tYour browser does not support the video tag.',
	'</video>',
	'',
	'After the video.'
].join('\n');

describe('renderBlogMarkdown', () => {
	it('frames interlude videos with a hidden play button for the post page', () => {
		const html = renderBlogMarkdown(interlude, { interludeVideoControls: true });

		expect(html).toMatch(
			/<div class="session-interlude"><video class="session-interlude-video"[\s\S]*<\/video><button type="button" class="session-interlude-toggle" aria-label="Play video" hidden><svg aria-hidden="true"[\s\S]*<\/button><\/div>/
		);
		expect(html).toContain('<p>Before the video.</p>');
		expect(html).toContain('<p>After the video.</p>');
	});

	it('leaves interlude videos bare without the option, as feeds need', () => {
		const html = renderBlogMarkdown(interlude);

		expect(html).toContain('<video class="session-interlude-video"');
		expect(html).not.toContain('session-interlude"');
		expect(html).not.toContain('<button');
	});

	it('leaves other HTML alone', () => {
		const markdown = '<video class="hero" muted>\n\t<source src="hero.mp4" />\n</video>';

		expect(renderBlogMarkdown(markdown, { interludeVideoControls: true })).not.toContain(
			'session-interlude'
		);
	});
});
