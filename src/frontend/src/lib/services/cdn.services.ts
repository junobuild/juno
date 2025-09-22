import { isDev } from '$lib/env/app.env';
import { fetchReleasesMetadata } from '$lib/rest/cdn.rest';
import { isEmptyString } from '@dfinity/utils';
import { type ReleasesMetadata, ReleasesMetadataSchema } from '@junobuild/admin';

export const getReleasesMetadata = async (): Promise<ReleasesMetadata> => {
	const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;

	// For local development and SkyLab we use a mock. This way one can work offline.
	if (isDev() && isEmptyString(JUNO_CDN_URL)) {
		const { default: data } = await import('$lib/env/cdn.metadata.mock.json');
		return ReleasesMetadataSchema.parse(data);
	}

	return await fetchReleasesMetadata({ cdnUrl: JUNO_CDN_URL });
};
