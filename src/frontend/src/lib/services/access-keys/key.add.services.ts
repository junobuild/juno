import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { AddAccessKeyParams, AddAccessKeyResult } from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

export type AddAccessKeyWithMissionControlFn = (params: {
	identity: Identity;
	missionControlId: MissionControlId;
}) => Promise<void>;

export type AddAccessKeyWithDevFn = (params: { identity: Identity }) => Promise<void>;

export const addAccessKey = async ({
	missionControlId,
	identity,
	addAccessKeyWithMissionControlFn,
	addAccessKeyWithDevFn
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	accessKey: AddAccessKeyParams;
	addAccessKeyWithMissionControlFn: AddAccessKeyWithMissionControlFn;
	addAccessKeyWithDevFn: AddAccessKeyWithDevFn;
}): Promise<AddAccessKeyResult> => {
	// TODO: duplicate code
	if (missionControlId === undefined) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return { result: 'error' };
	}

	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	try {
		const fn = async () => {
			if (nonNullish(missionControlId)) {
				await addAccessKeyWithMissionControlFn({
					identity,
					missionControlId
				});
				return;
			}

			await addAccessKeyWithDevFn({
				identity
			});
		};

		await fn();

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.controllers_add,
			detail: err
		});

		return { result: 'error', err };
	}
};
