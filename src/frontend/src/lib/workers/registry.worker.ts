import { getReleasesMetadata } from '$lib/rest/cdn.rest';
import { releasesIdbStore } from '$lib/stores/idb.store';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { last } from '$lib/utils/utils';
import { nonNullish } from '@dfinity/utils';
import type { ReleaseMetadata } from '@junobuild/admin';
import { getMany } from 'idb-keyval';
import { compare } from 'semver';

export const onRegistryMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'loadRegistry':
			await loadRegistry({ data });
			return;
	}
};

const loadRegistry = async ({ data: { segments } }: { data: PostMessageDataRequest }) => {
	await loadReleases();
};

const loadReleases = async (): Promise<
	{ result: 'loaded' | 'skip' } | { result: 'error'; err: unknown }
> => {
	try {
		const { mission_controls, orbiters, satellites, releases } = await getReleasesMetadata();

		const [knownMissionControls, knownOrbiters, knownSatellites, knownReleases] = await getMany(
			['mission_controls', 'orbiters', 'satellites', 'releases'],
			releasesIdbStore
		);

		const newestRelease = (releases: ReleaseMetadata[]): ReleaseMetadata | undefined =>
			last<ReleaseMetadata>(releases.sort(({ tag: tagA }, { tag: tagB }) => compare(tagA, tagB)));

		const newestFetchedRelease = newestRelease(releases);
		const newestKnownRelease = newestRelease(knownReleases ?? []);

		if (nonNullish(newestKnownRelease) && newestKnownRelease.tag === newestFetchedRelease?.tag) {
			// If there is no new releases, we do not need to update the saved metadata.
			// This way we can have some logic based on the timestamp at which we collected the data.
			return { result: 'skip' };
		}

		// await set(ICP_LEDGER_CANISTER_ID, exchangePrice, releasesIdbStore);

		return { result: 'loaded' };
	} catch (err: unknown) {
		return { result: 'error', err: err };
	}
};
