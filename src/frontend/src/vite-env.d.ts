interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_APP_VERSION: string;
	readonly VITE_CONSOLE_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
