import { describe, expect, it } from 'vitest';
import { blogPostingJsonLd, blogPostingScriptTag } from './structured-data';

const post = {
	slug: 'a-post',
	title: 'A post',
	ogDescription: 'What the post is about.',
	publicationDate: '2026-01-27',
	coverImage: 'https://example.com/cover.png'
};

describe('blogPostingJsonLd', () => {
	it('names the post, its author, its date and its address', () => {
		expect(JSON.parse(blogPostingJsonLd(post))).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: 'A post',
			description: 'What the post is about.',
			datePublished: '2026-01-27',
			image: 'https://example.com/cover.png',
			url: 'https://www.alicealexandra.com/blog/a-post',
			mainEntityOfPage: 'https://www.alicealexandra.com/blog/a-post',
			author: {
				'@type': 'Person',
				name: 'Alice Alexandra Moore',
				url: 'https://www.alicealexandra.com/'
			}
		});
	});

	it('leaves out fields the post has no value for', () => {
		const data = JSON.parse(
			blogPostingJsonLd({ ...post, ogDescription: '', publicationDate: '', coverImage: '' })
		);

		expect(data).not.toHaveProperty('description');
		expect(data).not.toHaveProperty('datePublished');
		expect(data).not.toHaveProperty('image');
	});

	it('cannot close its script tag early', () => {
		const json = blogPostingJsonLd({ ...post, title: 'Why </script> matters' });

		expect(json).not.toContain('</script>');
		expect(JSON.parse(json).headline).toBe('Why </script> matters');
	});

	it('wraps the JSON in one JSON-LD script tag', () => {
		const tag = blogPostingScriptTag({ ...post, title: 'Why </script> matters' });

		expect(tag.startsWith('<script type="application/ld+json">{')).toBe(true);
		expect(tag.endsWith('}</script>')).toBe(true);
		expect(tag.split('</script>')).toHaveLength(2);
	});
});
