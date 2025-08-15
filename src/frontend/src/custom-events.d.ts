declare module 'svelte/elements' {
	export interface HTMLAttributes<T> {
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

export {};
