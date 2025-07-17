import {
	CACHED_RELEASES_KEY,
	CACHED_RELEASES_MISSION_CONTROLS_KEY,
	CACHED_RELEASES_ORBITERS_KEY,
	CACHED_RELEASES_SATELLITES_KEY
} from '$lib/constants/releases.constants';
import { getReleasesMetadata } from '$lib/rest/cdn.rest';
import { getMissionControlVersionMetadata } from '$lib/services/version/version.metadata.mission-control.services';
import { getOrbiterVersionMetadata } from '$lib/services/version/version.metadata.orbiter.services';
import { getSatelliteVersionMetadata } from '$lib/services/version/version.metadata.satellite.services';
import { releasesIdbStore, versionIdbStore } from '$lib/stores/idb.store';
import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import type { CachedMetadataVersions, CachedReleases } from '$lib/types/releases';
import type {
	CachedSatelliteVersionMetadata,
	CachedVersionMetadata,
	VersionMetadata
} from '$lib/types/version';
import { last } from '$lib/utils/utils';
import { loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
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
	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const result = await loadReleases();

	if (result.result === 'error') {
		// TODO: postMessage error
		return;
	}

	// TODO: do something if segments is nullish?
	await loadVersions({ identity, segments: segments ?? [] });

	// TODO: postMessage releases for UI stores ?

	if (result.result === 'skip') {
		return;
	}
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
			knownVersions: CachedMetadataVersions | undefined;
			value: MetadataVersions;
		}): CachedMetadataVersions => ({
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
		return { result: 'error', err };
	}
};

const loadVersions = async ({
	identity,
	segments
}: {
	identity: Identity;
	segments: CanisterSegment[];
}): Promise<{ result: 'loaded' } | { result: 'error'; err: unknown }> => {
	try {
		const { satellites, missionControls, orbiters } = segments.reduce<{
			satellites: CanisterSegment[];
			missionControls: CanisterSegment[];
			orbiters: CanisterSegment[];
		}>(
			({ satellites, missionControls, orbiters }, { segment, ...rest }) => ({
				satellites: [...satellites, ...(segment === 'satellite' ? [{ segment, ...rest }] : [])],
				missionControls: [
					...missionControls,
					...(segment === 'mission_control' ? [{ segment, ...rest }] : [])
				],
				orbiters: [...orbiters, ...(segment === 'orbiter' ? [{ segment, ...rest }] : [])]
			}),
			{ satellites: [], missionControls: [], orbiters: [] }
		);

		const loadKnownVersionsMetadata = async (
			segments: CanisterSegment[]
		): Promise<
			(Pick<CanisterSegment, 'canisterId'> & {
				value: CachedVersionMetadata | CachedSatelliteVersionMetadata | undefined;
			})[]
		> => {
			const results = await getMany<CachedVersionMetadata | CachedSatelliteVersionMetadata>(
				segments.map(({ canisterId }) => canisterId),
				versionIdbStore
			);

			return segments.map(({ canisterId }, i) => ({ canisterId, value: results[i] }));
		};

		const [knownSatellites, knownMissionControls, knownOrbiters] = await Promise.all([
			loadKnownVersionsMetadata(satellites),
			loadKnownVersionsMetadata(missionControls),
			loadKnownVersionsMetadata(orbiters)
		]);

		const knownMetadata = [...knownSatellites, ...knownMissionControls, ...knownOrbiters];

		// TODO check if something to do

		const metadata = await Promise.all([
			...satellites.map(async ({ canisterId }) => ({
				canisterId,
				value: await getSatelliteVersionMetadata({
					identity,
					satelliteId: Principal.fromText(canisterId)
				})
			})),
			...missionControls.map(async ({ canisterId }) => ({
				canisterId,
				value: await getMissionControlVersionMetadata({
					identity,
					missionControlId: Principal.fromText(canisterId)
				})
			})),
			...orbiters.map(async ({ canisterId }) => ({
				canisterId,
				value: await getOrbiterVersionMetadata({
					identity,
					orbiterId: Principal.fromText(canisterId)
				})
			}))
		]);

		const now = new Date().getTime();

		const toCachedMetadata = ({
			knownMetadata,
			value
		}: {
			knownMetadata: CachedVersionMetadata | CachedSatelliteVersionMetadata | undefined;
			value: Omit<VersionMetadata, 'release'>;
		}): CachedVersionMetadata | CachedSatelliteVersionMetadata => ({
			value,
			createdAt: knownMetadata?.createdAt ?? now,
			updatedAt: now
		});

		await setMany(
			metadata
				.filter(({ value }) => 'metadata' in value && nonNullish(value.metadata))
				.map(({ canisterId, value }) => [
					canisterId,
					toCachedMetadata({
						// @ts-expect-error map does not infer the filter
						value: value.metadata,
						knownMetadata: knownMetadata.find(
							({ canisterId: knownCanisterId }) => knownCanisterId === canisterId
						)?.value
					})
				]),
			versionIdbStore
		);

		return { result: 'loaded' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};
