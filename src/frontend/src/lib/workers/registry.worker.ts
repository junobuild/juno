import {
	CACHED_RELEASES_KEY,
	CACHED_RELEASES_MISSIONS_CONTROL_KEY,
	CACHED_RELEASES_ORBITERS_KEY,
	CACHED_RELEASES_SATELLITES_KEY
} from '$lib/constants/releases.constants';
import { findNewestReleasesMetadata, getReleasesMetadata } from '$lib/rest/cdn.rest';
import { getMissionControlVersionMetadata } from '$lib/services/version/version.metadata.mission-control.services';
import { getOrbiterVersionMetadata } from '$lib/services/version/version.metadata.orbiter.services';
import { getSatelliteVersionMetadata } from '$lib/services/version/version.metadata.satellite.services';
import { releasesIdbStore, versionIdbStore } from '$lib/stores/idb.store';
import type { CanisterIdText, CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataRequest,
	PostMessageDataResponseError,
	PostMessageDataResponseRegistry,
	PostMessageRequest
} from '$lib/types/post-message';
import type { CachedMetadataVersions, CachedReleases } from '$lib/types/releases';
import type { SatelliteIdText } from '$lib/types/satellite';
import type {
	CachedSatelliteVersionMetadata,
	CachedVersionMetadata,
	SatelliteVersionMetadata,
	VersionMetadata
} from '$lib/types/version';
import { last } from '$lib/utils/utils';
import { loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { MetadataVersions, ReleaseMetadata } from '@junobuild/admin';
import { entries, getMany, setMany } from 'idb-keyval';
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
	if (isNullish(segments) || segments.length === 0) {
		// We do nothing if there is no segments
		return;
	}

	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const resultLoadReleases = await loadReleases();

	if (resultLoadReleases.result === 'error') {
		postMessageError(resultLoadReleases.err);
		return;
	}

	const { cachedReleases } = resultLoadReleases;

	const resultOutdatedVersions = await findOutdatedVersions({
		segments,
		cachedReleases
	});

	if (resultOutdatedVersions.result === 'error') {
		postMessageError(resultOutdatedVersions.err);
		return;
	}

	const { outdatedVersions } = resultOutdatedVersions;

	if (outdatedVersions.length === 0) {
		await syncRegistry({ segments });
		return;
	}

	const outdatedSegments = reduceOutdatedSegments({
		segments,
		outdatedVersions
	});

	const resultLoadVersions = await loadOutdatedVersions({ identity, outdatedSegments });

	if (resultLoadVersions.result === 'error') {
		postMessageError(resultLoadVersions.err);
		return;
	}

	await syncRegistry({ segments });
};

const loadReleases = async (): Promise<
	| { result: 'loaded' | 'skipped'; cachedReleases: CachedReleases }
	| { result: 'error'; err: unknown }
> => {
	try {
		const { mission_controls, orbiters, satellites, releases } = await getReleasesMetadata();

		const [knownMissionControls, knownOrbiters, knownSatellites, knownReleases] = await getMany(
			[
				CACHED_RELEASES_MISSIONS_CONTROL_KEY,
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
			return { result: 'skipped', cachedReleases: knownReleases };
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
				[CACHED_RELEASES_MISSIONS_CONTROL_KEY, updateCachedMissionControls],
				[CACHED_RELEASES_ORBITERS_KEY, updateCachedOrbiters],
				[CACHED_RELEASES_SATELLITES_KEY, updateCachedSatellites],
				[CACHED_RELEASES_KEY, updateCachedReleases]
			],
			releasesIdbStore
		);

		return { result: 'loaded', cachedReleases: updateCachedReleases };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

type OptionCachedVersionMetadata =
	| CachedVersionMetadata
	| CachedSatelliteVersionMetadata
	| undefined;

type OutdatedCachedVersions = [CanisterIdText, OptionCachedVersionMetadata][];

const findOutdatedVersions = async ({
	segments,
	cachedReleases
}: {
	segments: CanisterSegment[];
	cachedReleases: CachedReleases;
}): Promise<
	{ result: 'ok'; outdatedVersions: OutdatedCachedVersions } | { result: 'error'; err: unknown }
> => {
	try {
		const cachedVersions = await entries<
			CanisterIdText,
			CachedVersionMetadata | CachedSatelliteVersionMetadata
		>(versionIdbStore);

		// The versions that have not yet been cached
		const newVersions = segments
			.filter(
				({ canisterId }) =>
					cachedVersions.find(([cachedCanisterId]) => cachedCanisterId === canisterId) === undefined
			)
			.map<[CanisterIdText, undefined]>(({ canisterId }) => [canisterId, undefined]);

		// The cached versions that have been fetched before the newest release
		const { updatedAt: releasesLastUpdatedAt } = cachedReleases;

		const outdatedVersions = cachedVersions.filter(
			([_, cachedVersion]) => cachedVersion.updatedAt < releasesLastUpdatedAt
		);

		return { result: 'ok', outdatedVersions: [...outdatedVersions, ...newVersions] };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

const loadOutdatedVersions = async ({
	identity,
	outdatedSegments
}: {
	identity: Identity;
	outdatedSegments: OutdatedSegments;
}): Promise<{ result: 'ok' } | { result: 'error'; err: unknown }> => {
	try {
		const { satellites, missionControls, orbiters } = outdatedSegments;

		const metadata = await Promise.all([
			...satellites.map(async ([{ canisterId }]) => ({
				canisterId,
				value: await getSatelliteVersionMetadata({
					identity,
					satelliteId: Principal.fromText(canisterId)
				})
			})),
			...missionControls.map(async ([{ canisterId }]) => ({
				canisterId,
				value: await getMissionControlVersionMetadata({
					identity,
					missionControlId: Principal.fromText(canisterId)
				})
			})),
			...orbiters.map(async ([{ canisterId }]) => ({
				canisterId,
				value: await getOrbiterVersionMetadata({
					identity,
					orbiterId: Principal.fromText(canisterId)
				})
			}))
		]);

		const knownMetadata = [
			...satellites.map((satellite) => satellite),
			...missionControls.map((missionControl) => missionControl),
			...orbiters.map((orbiter) => orbiter)
		];

		const now = new Date().getTime();

		const toCachedMetadata = ({
			knownMetadata,
			value
		}: {
			knownMetadata: OptionCachedVersionMetadata;
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
							([knownSegment]) => knownSegment.canisterId === canisterId
						)?.[1]
					})
				]),
			versionIdbStore
		);

		return { result: 'ok' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

type OutdatedSegment = [CanisterSegment, OptionCachedVersionMetadata];

interface OutdatedSegments {
	satellites: OutdatedSegment[];
	missionControls: OutdatedSegment[];
	orbiters: OutdatedSegment[];
}

const reduceOutdatedSegments = ({
	outdatedVersions,
	segments
}: {
	outdatedVersions: OutdatedCachedVersions;
	segments: CanisterSegment[];
}): OutdatedSegments => {
	const { satellites, missionControls, orbiters } = groupSegments(segments);

	const mapOutdatedSegments = (segments: CanisterSegment[]): OutdatedSegment[] =>
		segments.map((segment) => [
			segment,
			outdatedVersions.find(
				([outdatedCanisterId]) => outdatedCanisterId === segment.canisterId
			)?.[1]
		]);

	return {
		satellites: mapOutdatedSegments(satellites),
		missionControls: mapOutdatedSegments(missionControls),
		orbiters: mapOutdatedSegments(orbiters)
	};
};

const syncRegistry = async ({ segments }: { segments: CanisterSegment[] }) => {
	const resultPrepare = await prepareSyncData({ segments });

	if (resultPrepare.result === 'error') {
		postMessageError(resultPrepare.err);
		return;
	}

	const { data } = resultPrepare;

	postMessage({
		msg: 'syncRegistry',
		data
	});
};

const prepareSyncData = async ({
	segments
}: {
	segments: CanisterSegment[];
}): Promise<
	{ result: 'ok'; data: PostMessageDataResponseRegistry } | { result: 'error'; err: unknown }
> => {
	try {
		const cachedVersions = await entries<
			CanisterIdText,
			CachedVersionMetadata | CachedSatelliteVersionMetadata
		>(versionIdbStore);

		const [cachedMissionControlReleases, cachedOrbiterReleases, cachedSatelliteReleases] =
			await getMany<CachedMetadataVersions | undefined>(
				[
					CACHED_RELEASES_MISSIONS_CONTROL_KEY,
					CACHED_RELEASES_ORBITERS_KEY,
					CACHED_RELEASES_SATELLITES_KEY
				],
				releasesIdbStore
			);

		// It throws an error if satellite, mission_control or orbiter is not resolved - i.e. we expect at least a module
		// per type to be released by Juno, which, is the case.
		const {
			satellite: newestSatelliteRelease,
			mission_control: newestMissionControlRelease,
			orbiter: newestOrbiterRelease
		} = findNewestReleasesMetadata({
			metadata: {
				orbiters: cachedOrbiterReleases?.value ?? [],
				mission_controls: cachedMissionControlReleases?.value ?? [],
				satellites: cachedSatelliteReleases?.value ?? []
			}
		});

		const { satellites, missionControls, orbiters } = groupSegments(segments);

		const registrySatellites = cachedVersions
			.filter(
				([cachedCanisterId]) =>
					satellites.find(({ canisterId }) => canisterId === cachedCanisterId) !== undefined
			)
			.reduce<Record<SatelliteIdText, SatelliteVersionMetadata>>(
				(acc, [canisterId, cachedValue]) => ({
					...acc,
					[canisterId]: {
						...cachedValue.value,
						// For TypeScript simplicity reasons
						build: 'build' in cachedValue.value ? cachedValue.value.build : 'stock',
						release: newestSatelliteRelease
					}
				}),
				{}
			);

		const [registryMissionControl, ...restMissionControls] = cachedVersions
			.filter(
				([cachedCanisterId]) =>
					missionControls.find(({ canisterId }) => canisterId === cachedCanisterId) !== undefined
			)
			.map(([_, { value }]) => value);

		if (restMissionControls.length > 0) {
			return {
				result: 'error',
				err: new Error(
					'More than one Mission Control provided to load the version. This is unexpected!'
				)
			};
		}

		const [registryOrbiter, ...restOrbiters] = cachedVersions
			.filter(
				([cachedCanisterId]) =>
					orbiters.find(({ canisterId }) => canisterId === cachedCanisterId) !== undefined
			)
			.map(([_, { value }]) => value);

		if (restOrbiters.length > 0) {
			return {
				result: 'error',
				err: new Error('More than one Orbiter provided to load the version. This is unexpected!')
			};
		}

		const data: PostMessageDataResponseRegistry = {
			registry: {
				satellites: registrySatellites,
				missionControl: {
					...registryMissionControl,
					release: newestMissionControlRelease
				},
				orbiter: {
					...registryOrbiter,
					release: newestOrbiterRelease
				}
			}
		};

		return { result: 'ok', data };
	} catch (error: unknown) {
		return { result: 'error', err: error };
	}
};

const groupSegments = (
	segments: CanisterSegment[]
): {
	satellites: CanisterSegment[];
	missionControls: CanisterSegment[];
	orbiters: CanisterSegment[];
} =>
	segments.reduce<{
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

const postMessageError = (error: unknown) => {
	const data: PostMessageDataResponseError = {
		error
	};

	postMessage({
		msg: 'syncRegistryError',
		data
	});
};
