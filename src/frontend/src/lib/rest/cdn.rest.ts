import type { ReleasesMetadata } from '@junobuild/admin';

export const getReleasesMetadata = async (): Promise<ReleasesMetadata> => {
	const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;

	const response = await fetch(`${JUNO_CDN_URL}/releases/metadata.json`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Fetching releases metadata failed.`);
	}

	const result: ReleasesMetadata = await response.json();

	return result;
};

export const downloadRelease = async ({
	segment,
	version
}: {
	segment: 'satellite' | 'mission_control';
	version: string;
}): Promise<string> => {
	const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;

	const htmlTemplate: Response = await fetch(
		`${JUNO_CDN_URL}/releases/${segment}-v${version}.wasm.gz`
	);
	return htmlTemplate.text();
};
