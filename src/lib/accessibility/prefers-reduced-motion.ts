import { browser } from '$app/environment';
import { readable } from 'svelte/store';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = readable(false, (set) => {
	if (!browser) return;

	const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

	const update = () => {
		set(mediaQuery.matches);
	};

	update();

	if (typeof mediaQuery.addEventListener === 'function') {
		mediaQuery.addEventListener('change', update);
		return () => mediaQuery.removeEventListener('change', update);
	}

	mediaQuery.addListener(update);
	return () => mediaQuery.removeListener(update);
});
