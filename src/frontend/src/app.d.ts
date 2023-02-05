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

declare namespace svelte.JSX {
	// Svelte needs help to support typing of custom events.
	// Source: https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
	// We use `<any>` because we cannot import the types we use in the dapps that needs to be explicitely imported in the components - i.e. we cannot use .d.ts for these types.
	interface HTMLAttributes<T> {
		onjunoIntersecting?: (event: CustomEvent<any>) => void;
		onjunoModal?: (event: CustomEvent<any>) => void;
		onjunoSyncCustomDomains?: (event: CustomEvent<any>) => void;
		onjunoSyncCanister?: (event: CustomEvent<any>) => void;
	}
}
