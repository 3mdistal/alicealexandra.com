// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { OwnerSession } from '$lib/server/owner-session';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			owner: OwnerSession | null;
			isOwner: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
