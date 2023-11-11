import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { initMissionControl as initMissionControlApi, releasesVersion } from '$lib/api/console.api';
import { missionControlVersion } from '$lib/api/mission-control.api';
import { orbiterVersion } from '$lib/api/orbiter.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import { fromNullable } from '$lib/utils/did.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const initMissionControl = async ({
	identity,
	onInitMissionControlSuccess
}: {
	identity: Identity;
	onInitMissionControlSuccess: (missionControlId: Principal) => Promise<void>;
}) =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<void>(async (resolve, reject) => {
		try {
			const { missionControlId } = await getMissionControl({
				identity
			});

			if (isNullish(missionControlId)) {
				setTimeout(async () => {
					try {
						await initMissionControl({ identity, onInitMissionControlSuccess });
						resolve();
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			await onInitMissionControlSuccess(missionControlId);

			resolve();
		} catch (err: unknown) {
			reject(err);
		}
	});

const getMissionControl = async ({
	identity
}: {
	identity: Identity | undefined;
}): Promise<{
	missionControlId: Principal | undefined;
}> => {
	if (!identity) {
		throw new Error('Invalid identity.');
	}

	const mission_control = await initMissionControlApi();

	const missionControlId: Principal | undefined = fromNullable<Principal>(
		mission_control.mission_control_id
	);

	return {
		missionControlId
	};
};

export const loadVersion = async ({
	satelliteId,
	missionControlId,
	skipReload
}: {
	satelliteId: Principal | undefined;
	missionControlId: Principal | undefined | null;
	skipReload: boolean;
}) => {
	if (isNullish(missionControlId)) {
		return;
	}

	// We load the satellite version once per session
	// We might load the mission control version twice per session if user go to that view first and then to overview
	const store = get(versionStore);
	if (nonNullish(satelliteId) && nonNullish(store.satellites[satelliteId.toText()]) && skipReload) {
		return;
	}

	try {
		const empty = (): Promise<undefined> => Promise.resolve(undefined);

		const [satVersion, ctrlVersion, releases] = await Promise.all([
			nonNullish(satelliteId) ? satelliteVersion({ satelliteId }) : empty(),
			missionControlVersion({ missionControlId }),
			releasesVersion()
		]);

		versionStore.setMissionControl({
			release: fromNullable(releases.mission_control),
			current: ctrlVersion
		});

		if (isNullish(satelliteId)) {
			return;
		}

		versionStore.setSatellite({
			satelliteId: satelliteId.toText(),
			version: nonNullish(satVersion)
				? {
						release: fromNullable(releases.satellite),
						current: satVersion
				  }
				: undefined
		});
	} catch (err: unknown) {
		toasts.error({
			text: `Cannot fetch the versions information.`,
			detail: err
		});
	}
};

export const loadOrbiterVersion = async ({ orbiter }: { orbiter: Orbiter | null | undefined }) => {
	if (isNullish(orbiter)) {
		return;
	}

	// We load the orbiter version once per session
	const store = get(versionStore);
	if (nonNullish(store.orbiter)) {
		return;
	}

	const [orbVersion, releases] = await Promise.all([
		orbiterVersion({ orbiterId: orbiter.orbiter_id }),
		releasesVersion()
	]);

	versionStore.setOrbiter({
		release: fromNullable(releases.orbiter),
		current: orbVersion
	});
};
