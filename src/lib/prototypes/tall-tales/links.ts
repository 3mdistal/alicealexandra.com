// Prototype only: links for the variant switcher on the Tall Tales prototypes.

export function landingLinks() {
	return [
		{ label: 'now', href: '/studio/tall-tales' },
		{ label: '1', href: '/proto/tall-tales/landing-1' },
		{ label: '2', href: '/proto/tall-tales/landing-2' },
		{ label: '3', href: '/proto/tall-tales/landing-3' }
	];
}

export function storyLinks(slug: string) {
	return [
		{ label: 'now', href: `/studio/tall-tales/${slug}` },
		{ label: '1', href: `/proto/tall-tales/story-1/${slug}` },
		{ label: '2', href: `/proto/tall-tales/story-2/${slug}` },
		{ label: '3', href: `/proto/tall-tales/story-3/${slug}` }
	];
}
