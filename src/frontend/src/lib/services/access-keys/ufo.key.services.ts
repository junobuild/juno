import { canisterStatus } from '$lib/api/ic.api';
import { setAdminController } from '$lib/services/access-keys/key.admin.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { AccessKeyIdParam, AccessKeyUi, AddAccessKeyParams, AddAccessKeyResult } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { UfoId } from '$lib/types/ufo';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const listUfoControllers = async ({
	ufoId,
	identity
}: {
	ufoId: UfoId;
	identity: NullishIdentity;
}): Promise<[Principal, AccessKeyUi][]> => {
	assertNonNullish(identity);

	const {
		settings: { controllers }
	} = await canisterStatus({
		canisterId: ufoId.toText(),
		identity
	});

	return controllers.map((controllerId) => [
		controllerId,
		{
			kind: toNullable(),
			metadata: toNullable(),
			scope: { Admin: null }
		}
	]);
};

export const addUfoController = async ({
	identity,
	accessKey: { scope, ...accessKeyRest },
	ufoId
}: {
	identity: NullishIdentity;
	accessKey: AddAccessKeyParams;
	ufoId: UfoId;
}): Promise<AddAccessKeyResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	if (scope !== 'admin') {
		toasts.error({ text: get(i18n).errors.ufo_controller_not_admin });
		return { result: 'error' };
	}

	try {
		await setAdminController({
			...accessKeyRest,
			canisterId: ufoId,
			identity
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

export const removeUfoController = async ({
	identity,
	accessKey: { accessKeyId },
	ufoId
}: {
	identity: NullishIdentity;
	accessKey: AccessKeyIdParam;
	ufoId: UfoId;
}): Promise<AddAccessKeyResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	try {
		await setAdminController({
			...accessKeyRest,
			canisterId: ufoId,
			identity
		});

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.controllers_delete,
			detail: err
		});

		return { result: 'error', err };
	}
};
