import {
	CACHED_RELEASES_KEY,
	CACHED_RELEASES_MISSION_CONTROLS_KEY,
	CACHED_RELEASES_ORBITERS_KEY,
	CACHED_RELEASES_SATELLITES_KEY
} from '$lib/constants/registry.constants';
import { getReleasesMetadata } from '$lib/rest/cdn.rest';
import { releasesIdbStore } from '$lib/stores/idb.store';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import type { CachedReleases, CachedVersions } from '$lib/types/registry';
import { last } from '$lib/utils/utils';
import { nonNullish } from '@dfinity/utils';
import type { MetadataVersions, ReleaseMetadata } from '@junobuild/admin';
import { getMany, setMany } from 'idb-keyval';
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
			[
				CACHED_RELEASES_MISSION_CONTROLS_KEY,
				CACHED_RELEASES_ORBITERS_KEY,
				CACHED_RELEASES_SATELLITES_KEY,
				CACHED_RELEASES_KEY
			],
			releasesIdbStore
		);

		const newestRelease = (releases: ReleaseMetadata[]): ReleaseMetadata | undefined =>
			last<ReleaseMetadata>(releases.sort(({ tag: tagA }, { tag: tagB }) => compare(tagA, tagB)));

		const newestFetchedRelease = newestRelease(releases);
		const newestKnownRelease = newestRelease(knownReleases?.value ?? []);

		if (nonNullish(newestKnownRelease) && newestKnownRelease.tag === newestFetchedRelease?.tag) {
			// If there is no new releases, we do not need to update the saved metadata.
			// This way we can have some logic based on the timestamp at which we collected the data.
			return { result: 'skip' };
		}

		const now = new Date().getTime();

		const updateCachedReleases: CachedReleases = {
			value: releases,
			createdAt: knownReleases?.createdAt ?? now,
			updatedAt: now
		};

		const toCachedVersions = ({
			knownVersions,
			value
		}: {
			knownVersions: CachedVersions | undefined;
			value: MetadataVersions;
		}): CachedVersions => ({
			value,
			createdAt: knownVersions?.createdAt ?? now,
			updatedAt: now
		});

		const updateCachedMissionControls = toCachedVersions({
			knownVersions: knownMissionControls,
			value: mission_controls
		});

		const updateCachedSatellites = toCachedVersions({
			knownVersions: knownSatellites,
			value: satellites
		});

		const updateCachedOrbiters = toCachedVersions({
			knownVersions: knownOrbiters,
			value: orbiters
		});

		await setMany(
			[
				[CACHED_RELEASES_MISSION_CONTROLS_KEY, updateCachedMissionControls],
				[CACHED_RELEASES_ORBITERS_KEY, updateCachedOrbiters],
				[CACHED_RELEASES_SATELLITES_KEY, updateCachedSatellites],
				[CACHED_RELEASES_KEY, updateCachedReleases]
			],
			releasesIdbStore
		);

		return { result: 'loaded' };
	} catch (err: unknown) {
		return { result: 'error', err: err };
	}
};
