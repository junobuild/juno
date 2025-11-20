interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	// package.json
	readonly VITE_APP_VERSION: string;

	// juno.config.mjs
	readonly VITE_CONSOLE_ID: string;
	readonly VITE_GOOGLE_CLIENT_ID: string | undefined;

	// .env
	readonly VITE_BN_REGISTRATIONS_URL: string | '' | undefined;
	readonly VITE_BN_CUSTOM_DOMAINS_URL: string | '' | undefined;
	readonly VITE_JUNO_CDN_URL: string | '' | undefined;
	readonly VITE_CYCLE_EXPRESS_URL: string | '' | undefined;
	readonly VITE_KONGSWAP_API_URL: string | '' | undefined;
	readonly VITE_ICP_EXPLORER_URL: string | '' | undefined;
	readonly VITE_EMULATOR_ADMIN_URL: string | '' | undefined;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
