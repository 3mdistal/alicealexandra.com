import type { ScrollTriggerStatic } from '../types/gsap';

export async function loadScrollTrigger(): Promise<ScrollTriggerStatic> {
	const module = await import('gsap/dist/ScrollTrigger');
	const { ScrollTrigger } = module;
	return ScrollTrigger as ScrollTriggerStatic;
}
