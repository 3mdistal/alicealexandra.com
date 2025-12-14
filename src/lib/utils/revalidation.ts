import { browser } from '$app/environment';

/**
 * Triggers ISR revalidation for a specific route in the background.
 * This is meant to be called after page load to refresh content for the next visitor.
 * 
 * @param route - The route to revalidate (e.g., '/studio', '/blog')
 * @param options - Optional configuration
 */
export async function triggerRevalidation(
	route: string,
	options: {
		timeout?: number;
	} = {}
): Promise<boolean> {
	// Only run in browser context
	if (!browser) return false;

	const { timeout = 5000 } = options;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch('/api/revalidate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ route }),
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (response.ok) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

/**
 * Creates a revalidation function for a specific route.
 * Useful for pages that always revalidate the same route.
 * 
 * @param route - The route to revalidate
 * @returns A function that triggers revalidation for the specified route
 */
export function createRevalidationTrigger(route: string) {
	return (options?: { timeout?: number }) => triggerRevalidation(route, options);
}

/**
 * Hook for triggering revalidation on component mount.
 * Best practice: Call this in onMount to trigger background revalidation.
 * 
 * @param route - The route to revalidate
 * @param options - Optional configuration
 */
export function useBackgroundRevalidation(
	route: string,
	options: {
		timeout?: number;
		delay?: number; // Delay before triggering revalidation
	} = {}
) {
	const { delay = 0, ...revalidationOptions } = options;

	if (browser) {
		if (delay > 0) {
			setTimeout(() => {
				triggerRevalidation(route, revalidationOptions);
			}, delay);
		} else {
			triggerRevalidation(route, revalidationOptions);
		}
	}
}
