import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type {
	AccessKeyIdParam,
	AccessKeyWithDevFn,
	AccessKeyWithMissionControlFn,
	AddAccessKeyParams,
	AddAccessKeyResult
} from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const addAccessKey = async ({
	addAccessKeyWithMissionControlFn,
	addAccessKeyWithDevFn,
	...rest
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	accessKey: AddAccessKeyParams;
	addAccessKeyWithMissionControlFn: AccessKeyWithMissionControlFn;
	addAccessKeyWithDevFn: AccessKeyWithDevFn;
}): Promise<AddAccessKeyResult> =>
	await executeAccessKey({
		accessKeyWithDevFn: addAccessKeyWithDevFn,
		accessKeyWithMissionControlFn: addAccessKeyWithMissionControlFn,
		errorLabel: get(i18n).errors.controllers_add,
		...rest
	});

export const removeAccessKey = async ({
	removeAccessKeyWithMissionControlFn,
	removeAccessKeyWithDevFn,
	...rest
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	accessKey: AccessKeyIdParam;
	removeAccessKeyWithMissionControlFn: AccessKeyWithMissionControlFn;
	removeAccessKeyWithDevFn: AccessKeyWithDevFn;
}): Promise<AddAccessKeyResult> =>
	await executeAccessKey({
		accessKeyWithDevFn: removeAccessKeyWithDevFn,
		accessKeyWithMissionControlFn: removeAccessKeyWithMissionControlFn,
		errorLabel: get(i18n).errors.controllers_delete,
		...rest
	});

const executeAccessKey = async <AccessKeyParams>({
	missionControlId,
	identity,
	accessKeyWithMissionControlFn,
	accessKeyWithDevFn,
	errorLabel
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	accessKey: AccessKeyParams;
	accessKeyWithMissionControlFn: AccessKeyWithMissionControlFn;
	accessKeyWithDevFn: AccessKeyWithDevFn;
	errorLabel: string;
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
				await accessKeyWithMissionControlFn({
					identity,
					missionControlId
				});
				return;
			}

			await accessKeyWithDevFn({
				identity
			});
		};

		await fn();

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: errorLabel,
			detail: err
		});

		return { result: 'error', err };
	}
};
