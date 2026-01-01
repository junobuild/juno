import { setMissionControlController } from '$lib/api/mission-control.api';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { AddAccessKeyResult, SetAccessKeyParams } from '$lib/types/controllers';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const addMissionControlAccessKey = async ({
	identity,
	missionControlId,
	accessKeyId,
	scope,
	profile
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & SetAccessKeyParams): Promise<AddAccessKeyResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	try {
		await setMissionControlController({
			identity,
			missionControlId,
			accessKeyId,
			scope,
			profile
		});

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.controllers_add,
			detail: err
		});

		return { result: 'error', err };
	}
};
