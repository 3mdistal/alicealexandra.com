import { describe, expect, it } from 'vitest';
import { headingSlug, renderBlogMarkdown } from './render-markdown';

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

describe('heading IDs', () => {
	it('gives each heading an ID made from its words', () => {
		const html = renderBlogMarkdown(
			'## Session 1\n\n### Subjective\n\n## Caffeine ☕, medication 💊, and stimming'
		);

		expect(html).toContain('<h2 id="session-1">Session 1</h2>');
		expect(html).toContain('<h3 id="subjective">Subjective</h3>');
		expect(html).toContain('<h2 id="caffeine-medication-and-stimming">');
	});

	it('numbers repeated headings from 2, so every ID in a post is unique', () => {
		const html = renderBlogMarkdown('### Plan\n\n### Plan\n\n### Plan 2\n\n### Plan');

		expect(html.match(/id="[^"]*"/g)).toEqual([
			'id="plan"',
			'id="plan-2"',
			'id="plan-2-2"',
			'id="plan-3"'
		]);
	});

	it('starts the numbering over for each post', () => {
		renderBlogMarkdown('## Notes');

		expect(renderBlogMarkdown('## Notes')).toContain('<h2 id="notes">');
	});

	it('drops markup, apostrophes and accents from the ID', () => {
		expect(headingSlug('I wasn’t gonna <em>stop</em>')).toBe('i-wasnt-gonna-stop');
		expect(headingSlug('Let&#39;s be real')).toBe('lets-be-real');
		expect(headingSlug('Café &amp; crème')).toBe('cafe-creme');
		expect(renderBlogMarkdown('## ☕')).toContain('<h2 id="section">');
	});
});

describe('superscript and subscript markers', () => {
	it('renders {super:} and {sub:} as sup and sub', () => {
		expect(renderBlogMarkdown('Done{super:TM}, mostly{sub:ish}.')).toBe(
			'<p>Done<sup>TM</sup>, mostly<sub>ish</sub>.</p>\n'
		);
	});

	it('renders them in headings and lists, leaving them out of the ID', () => {
		const html = renderBlogMarkdown('## Espresso{super:TM}\n\n- H{sub:2}O');

		expect(html).toContain('<h2 id="espressotm">Espresso<sup>TM</sup></h2>');
		expect(html).toContain('<li>H<sub>2</sub>O</li>');
	});

	it('leaves code alone', () => {
		expect(renderBlogMarkdown('`{super:TM}`')).toContain('<code>{super:TM}</code>');
	});
});
