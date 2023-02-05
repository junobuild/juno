// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

declare const VITE_APP_VERSION: string;

/* eslint-disable */

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onjunoIntersecting?: (event: CustomEvent<any>) => void;
		onjunoModal?: (event: CustomEvent<any>) => void;
		onjunoSyncCustomDomains?: (event: CustomEvent<any>) => void;
		onjunoSyncCanister?: (event: CustomEvent<any>) => void;
	}
}

/* eslint-enable */
