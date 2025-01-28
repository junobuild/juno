import { last } from '$lib/utils/utils';
import type { ReleaseMetadata, ReleasesMetadata } from '@junobuild/admin';
import { assertNonNullish } from '@dfinity/utils';
import { compare } from 'semver';

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

export const getNewestReleasesMetadata = async (): Promise<
	Pick<ReleaseMetadata, 'satellite' | 'mission_control' | 'orbiter'>
> => {
	const metadata = await getReleasesMetadata();

	const newest = (
		segmentKeys: 'satellites' | 'mission_controls' | 'orbiters'
	): string | undefined => last((metadata[segmentKeys] ?? []).sort((a, b) => compare(a, b)));

	const satellite = newest('satellites');
	const mission_control = newest('mission_controls');
	const orbiter = newest('orbiters');

	assertNonNullish(satellite);
	assertNonNullish(mission_control);
	assertNonNullish(orbiter);

	return {
		satellite,
		mission_control,
		orbiter
	};
};

export const downloadRelease = async ({
	segment,
	version
}: {
	segment: 'satellite' | 'mission_control' | 'orbiter';
	version: string;
}): Promise<Blob> => {
	const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;

	const response: Response = await fetch(`${JUNO_CDN_URL}/releases/${segment}-v${version}.wasm.gz`);

	return await response.blob();
};
