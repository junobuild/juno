import { last } from '$lib/utils/utils';
import { assertNonNullish } from '@dfinity/utils';
import {
	type ReleaseMetadata,
	type ReleasesMetadata,
	ReleasesMetadataSchema
} from '@junobuild/admin';
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

	const result = await response.json();

	return ReleasesMetadataSchema.parse(result);
};

/**
 * @deprecated use store or idb
 */
export const getNewestReleasesMetadata = async (): Promise<
	Required<Pick<ReleaseMetadata, 'satellite' | 'mission_control' | 'orbiter'>>
> => {
	const metadata = await getReleasesMetadata();
	return findNewestReleasesMetadata({ metadata });
};

export const findNewestReleasesMetadata = ({
	metadata
}: {
	metadata: Omit<ReleasesMetadata, 'releases'>;
}): Required<Pick<ReleaseMetadata, 'satellite' | 'mission_control' | 'orbiter'>> => {
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
