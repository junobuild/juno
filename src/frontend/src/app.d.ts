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

declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		'on:junoIntersecting'?: (event: CustomEvent<any>) => void;
		'on:junoModal'?: (event: CustomEvent<any>) => void;
		'on:junoSyncCustomDomains'?: (event: CustomEvent<any>) => void;
		'on:junoSyncCanister'?: (event: CustomEvent<any>) => void;
		'on:junoRestartCycles'?: (event: CustomEvent<any>) => void;
		'on:junoReloadVersions'?: (event: CustomEvent<any>) => void;
	}
}

/* eslint-enable */
