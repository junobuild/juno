export const EXTERNAL_ALTERNATIVE_ORIGINS = ['other.com', 'another.com'];
export const EXTERNAL_ALTERNATIVE_ORIGINS_URLS = EXTERNAL_ALTERNATIVE_ORIGINS.map(
	(url) => `https://${url}`
);

export const LOG_SALT_INITIALIZED = 'Authentication salt initialized.';
export const LOG_SALT_ALREADY_INITIALIZED = 'Authentication salt exists. Skipping initialization.';