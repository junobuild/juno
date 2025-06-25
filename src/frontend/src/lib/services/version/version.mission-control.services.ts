import { missionControlVersion } from '$lib/api/mission-control.deprecated.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import type { MissionControlId } from '$lib/types/mission-control';
import type { LoadVersionBaseParams, LoadVersionResult, VersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { getJunoPackage } from '@junobuild/admin';
import { get } from 'svelte/store';

export const reloadMissionControlVersion = async ({
	missionControlId,
	toastError = true,
	...rest
}: {
	missionControlId: MissionControlId;
} & LoadVersionBaseParams): Promise<LoadVersionResult> => {
	const result = await loadMissionControlVersion({
		missionControlId,
		...rest
	});

	if (result.result === 'error' && toastError) {
		toasts.error({
			text: get(i18n).errors.load_version,
			detail: result.err
		});
	}

	return result;
};

const loadMissionControlVersion = async ({
	missionControlId,
	identity,
	skipReload
}: {
	missionControlId: MissionControlId;
} & Omit<LoadVersionBaseParams, 'toastError'>): Promise<LoadVersionResult> => {
	// We load the satellite version once per session
	// We might load the mission control version twice per session if user go to that view first and then to overview
	const store = get(versionStore);
	if (skipReload && nonNullish(store.missionControl)) {
		return { result: 'skipped' };
	}

	try {
		// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
		assertNonNullish(identity);

		const missionControlInfo = async (): Promise<Omit<VersionMetadata, 'release'>> => {
			const [junoPkg] = await Promise.allSettled([
				getJunoPackage({
					moduleId: missionControlId,
					identity,
					...container()
				})
			]);

			if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
				const pkg = junoPkg.value;
				const { version } = pkg;

				return {
					current: version,
					pkg
				};
			}

			// Legacy way of fetch build and version information
			const version = await missionControlVersion({ missionControlId, identity });

			return {
				current: version
			};
		};

		const [ctrlVersion, releases] = await Promise.all([
			missionControlInfo(),
			getNewestReleasesMetadata()
		]);

		versionStore.setMissionControl({
			release: releases.mission_control,
			...ctrlVersion
		});

		return { result: 'loaded' };
	} catch (err: unknown) {
		versionStore.setMissionControl(null);

		return { result: 'error', err };
	}
};
