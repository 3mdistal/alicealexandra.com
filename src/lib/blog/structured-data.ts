import { shareImageUrl } from '$lib/blog/share-image';

const SITE_URL = 'https://www.alicealexandra.com';

export interface BlogPostingFields {
	slug: string;
	title: string;
	ogDescription: string;
	publicationDate: string;
	coverImage: string;
}

/**
 * The schema.org BlogPosting that tells search engines who wrote a post and when, as the
 * contents of a `<script type="application/ld+json">` tag.
 *
 * `<` is escaped so a title containing `</script>` can't close the tag early; JSON reads
 * `<` back as the same character.
 */
export function blogPostingJsonLd(post: BlogPostingFields): string {
	const url = `${SITE_URL}/blog/${post.slug}`;
	const data = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		...(post.ogDescription ? { description: post.ogDescription } : {}),
		...(post.publicationDate ? { datePublished: post.publicationDate } : {}),
		...(post.coverImage ? { image: shareImageUrl(post.coverImage) } : {}),
		url,
		mainEntityOfPage: url,
		author: { '@type': 'Person', name: 'Alice Alexandra Moore', url: `${SITE_URL}/` }
	};
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
