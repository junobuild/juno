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
		onjunoIntersecting?: (event: CustomEvent<any>) => void;
		onjunoModal?: (event: CustomEvent<any>) => void;
		onjunoSyncCustomDomains?: (event: CustomEvent<any>) => void;
		onjunoRestartCycles?: (event: CustomEvent<any>) => void;
		onjunoReloadVersions?: (event: CustomEvent<any>) => void;
		onjunoCloseActions?: (event: CustomEvent<any>) => void;
		onjunoRegistrationState?: (event: CustomEvent<any>) => void;
		onjunoReloadAuthConfig?: (event: CustomEvent<any>) => void;
		onjunoRestartWallet?: (event: CustomEvent<any>) => void;
	}
}

/* eslint-enable */
