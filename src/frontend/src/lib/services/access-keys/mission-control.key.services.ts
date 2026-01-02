import {
	deleteMissionControlController,
	setMissionControlController
} from '$lib/api/mission-control.api';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type {
	AccessKeyIdParam,
	AddAccessKeyParams,
	AddAccessKeyResult
} from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

type ApplyAccessKeyFn = (params: { identity: Identity }) => Promise<void>;

export const addMissionControlAccessKey = async ({
	missionControlId,
	accessKeyId,
	scope,
	profile,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & AddAccessKeyParams): Promise<AddAccessKeyResult> => {
	const applyAccessKeyFn: ApplyAccessKeyFn = async ({ identity }) => {
		await setMissionControlController({
			identity,
			missionControlId,
			accessKeyId,
			scope,
			profile
		});
	};

	return await executeAccessKey({
		...rest,
		applyAccessKeyFn
	});
};

export const removeMissionControlAccessKey = async ({
	missionControlId,
	accessKeyId,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & AccessKeyIdParam): Promise<AddAccessKeyResult> => {
	const applyAccessKeyFn: ApplyAccessKeyFn = async ({ identity }) => {
		await deleteMissionControlController({
			identity,
			missionControlId,
			accessKeyId
		});
	};

	return await executeAccessKey({
		...rest,
		applyAccessKeyFn
	});
};

const executeAccessKey = async ({
	identity,
	applyAccessKeyFn
}: {
	identity: OptionIdentity;
	applyAccessKeyFn: ApplyAccessKeyFn;
}): Promise<AddAccessKeyResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	try {
		await applyAccessKeyFn({ identity });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.controllers_add,
			detail: err
		});

		return { result: 'error', err };
	}
};
