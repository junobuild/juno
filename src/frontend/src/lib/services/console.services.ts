import type { ConsoleDid } from '$declarations';
import {
	getMissionControl as getMissionControlApi,
	initMissionControl as initMissionControlApi
} from '$lib/api/console.api';
import { missionControlErrorSignOut } from '$lib/services/auth/auth.services';
import { i18n } from '$lib/stores/i18n.store';
import { missionControlCertifiedStore } from '$lib/stores/mission-control.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { fromNullable, isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

interface Certified {
	certified: boolean;
}

type PollAndInitResult = {
	missionControl: ConsoleDid.MissionControl;
} & Certified;

export const initMissionControl = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// If not signed in, we are not going to init and load a mission control.
	if (isNullish(identity)) {
		return { result: 'skip' };
	}

	try {
		// Poll to init mission control center
		const { missionControl, certified } = await pollAndInitMissionControl({
			identity
		});

		missionControlCertifiedStore.set({
			data: missionControl,
			certified
		});

		if (certified) {
			return { result: 'success' };
		}

		// We deliberately do not await the promise to avoid blocking the main UX. However, if necessary, we take the required measures if Mission Control cannot be certified.
		assertMissionControl({ identity });

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.initializing_mission_control,
			detail: err
		});

		// There was an error so, we sign the user out otherwise skeleton and other spinners will be displayed forever
		await missionControlErrorSignOut();

		return { result: 'error' };
	}
};

const pollAndInitMissionControl = async ({
	identity
}: {
	identity: Identity;
	// eslint-disable-next-line require-await
}): Promise<PollAndInitResult> =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<PollAndInitResult>(async (resolve, reject) => {
		try {
			const { missionControl, certified } = await getOrInitMissionControl({
				identity
			});

			const missionControlId = fromNullable(missionControl.mission_control_id);

			// TODO: we can/should probably add a max time to not retry forever even though the user will probably close their browsers.
			if (isNullish(missionControlId)) {
				setTimeout(async () => {
					try {
						const result = await pollAndInitMissionControl({ identity });
						resolve(result);
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			resolve({ missionControl, certified });
		} catch (err: unknown) {
			reject(err);
		}
	});

export const getOrInitMissionControl = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ missionControl: ConsoleDid.MissionControl } & Certified> => {
	const existingMissionControl = await getMissionControlApi({ identity, certified: false });

	if (isNullish(existingMissionControl)) {
		const newMissionControl = await initMissionControlApi(identity);

		return {
			missionControl: newMissionControl,
			certified: true
		};
	}

	return {
		missionControl: existingMissionControl,
		certified: false
	};
};

const assertMissionControl = async ({ identity }: { identity: Identity }) => {
	try {
		await getMissionControlApi({ identity, certified: true });
	} catch (_err: unknown) {
		await missionControlErrorSignOut();
	}
};
