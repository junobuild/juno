import type { ICDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { setAdminController } from '$lib/services/access-keys/key.admin.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type {
	AccessKeyIdParam,
	AccessKeyUi,
	AddAccessKeyParams,
	AddAccessKeyResult
} from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { UfoId } from '$lib/types/ufo';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
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
		const controllerId = Principal.isPrincipal(accessKeyId)
			? accessKeyId
			: Principal.fromText(accessKeyId);

		await removeController({
			controllerId,
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

const removeController = async ({
	controllerId,
	canisterId,
	identity
}: {
	controllerId: Principal;
	canisterId: Principal;
	identity: Identity;
}): Promise<{ result: 'ok' | 'skip' } | { result: 'reject'; reason: string }> => {
	const {
		settings: { controllers: currentControllers }
	} = await canisterStatus({
		identity,
		canisterId: canisterId.toText(),
		// We need to be sure the list of controllers we get is correct here
		// as we are using those to update the settings.
		certified: true
	});

	const remainingControllers = currentControllers.filter(
		(cId) => cId.toText() !== controllerId.toText()
	);

	const updateSettings: ICDid.canister_settings = {
		environment_variables: toNullable(),
		compute_allocation: toNullable(),
		freezing_threshold: toNullable(),
		log_visibility: toNullable(),
		memory_allocation: toNullable(),
		reserved_cycles_limit: toNullable(),
		wasm_memory_limit: toNullable(),
		wasm_memory_threshold: toNullable(),
		controllers: toNullable(remainingControllers)
	};

	await canisterUpdateSettings({
		canisterId,
		identity,
		settings: updateSettings
	});

	return { result: 'ok' };
};
