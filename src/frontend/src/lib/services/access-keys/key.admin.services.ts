import type { ICDid, OrbiterDid, SatelliteDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { MAX_NUMBER_OF_CONTROLLERS } from '$lib/constants/canister.constants';
import { i18n } from '$lib/stores/app/i18n.store';
import type { AccessKeyIdParam, AddAdminAccessKeyParams } from '$lib/types/access-keys';
import { toSetController } from '$lib/utils/controllers.utils';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface SetAccessKeysFnParams {
	args: SatelliteDid.SetControllersArgs | OrbiterDid.SetControllersArgs;
}

interface DeleteAccessKeysFnParams {
	args: SatelliteDid.DeleteControllersArgs | OrbiterDid.DeleteControllersArgs;
}

export type SetAccessKeysFn = (params: SetAccessKeysFnParams) => Promise<void>;

export type DeleteAccessKeysFn = (params: DeleteAccessKeysFnParams) => Promise<void>;

export type AdminAccessKeyResult =
	| { result: 'ok' | 'skip' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };

type ApplyAccessKeyFn = (params: { controllerId: Principal }) => Promise<void>;

type UpdateControllersFn = (params: {
	controllerId: Principal;
	currentControllers: Principal[];
}) => { result: 'ok' | 'skip' } | { result: 'reject'; reason: string };

export const setAdminAccessKey = async ({
	setAccessKeysFn,
	attachFn,
	canisterId,
	metadata,
	...rest
}: {
	setAccessKeysFn: SetAccessKeysFn;
	attachFn?: () => Promise<void>;
	canisterId: Principal;
	identity: Identity;
} & AddAdminAccessKeyParams): Promise<AdminAccessKeyResult> => {
	const applyAccessKeyFn: ApplyAccessKeyFn = async ({ controllerId }) => {
		await setAccessKeysFn({
			args: {
				controller: toSetController({
					metadata,
					scope: 'admin'
				}),
				controllers: [controllerId]
			}
		});

		await attachFn?.();
	};

	const updateControllersFn: UpdateControllersFn = ({ currentControllers, controllerId }) => {
		if (currentControllers.length >= MAX_NUMBER_OF_CONTROLLERS - 1) {
			return { result: 'reject', reason: get(i18n).errors.canister_controllers };
		}

		const alreadyController =
			currentControllers.find((id) => id.toText() === controllerId.toText()) !== undefined;

		if (alreadyController) {
			return { result: 'skip' };
		}

		return { result: 'ok', controllers: [...currentControllers, controllerId] };
	};

	return await executeAdminAccessKey({
		applyAccessKeyFn,
		updateControllersFn,
		canisterId,
		...rest
	});
};

export const removeAdminAccessKey = async ({
	deleteAccessKeysFn,
	attachFn,
	canisterId,
	...rest
}: {
	deleteAccessKeysFn: DeleteAccessKeysFn;
	attachFn?: () => Promise<void>;
	canisterId: Principal;
	identity: Identity;
} & AccessKeyIdParam): Promise<AdminAccessKeyResult> => {
	const applyAccessKeyFn: ApplyAccessKeyFn = async ({ controllerId }) => {
		await deleteAccessKeysFn({
			args: {
				controllers: [controllerId]
			}
		});

		await attachFn?.();
	};

	const updateControllersFn: UpdateControllersFn = ({ currentControllers, controllerId }) => {
		const notControllerCurrently =
			currentControllers.find((id) => id.toText() === controllerId.toText()) === undefined;

		if (notControllerCurrently) {
			return { result: 'skip' };
		}

		const filteredControllers = currentControllers.filter(
			(id) => id.toText() !== controllerId.toText()
		);

		return { result: 'ok', controllers: filteredControllers };
	};

	return await executeAdminAccessKey({
		applyAccessKeyFn,
		updateControllersFn,
		canisterId,
		...rest
	});
};

const executeAdminAccessKey = async ({
	applyAccessKeyFn,
	updateControllersFn,
	canisterId,
	accessKeyId: controllerIdParam,
	identity
}: {
	applyAccessKeyFn: ApplyAccessKeyFn;
	updateControllersFn: UpdateControllersFn;
	canisterId: Principal;
	identity: Identity;
} & AccessKeyIdParam): Promise<AdminAccessKeyResult> => {
	try {
		const controllerId = Principal.isPrincipal(controllerIdParam)
			? controllerIdParam
			: Principal.fromText(controllerIdParam);

		const result = await updateIcMgmtController({
			controllerId,
			identity,
			canisterId,
			updateControllersFn
		});

		if (result.result === 'reject') {
			return result;
		}

		await applyAccessKeyFn({ controllerId });

		return { result: 'ok' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

const updateIcMgmtController = async ({
	canisterId,
	controllerId,
	identity,
	updateControllersFn
}: {
	canisterId: Principal;
	controllerId: Principal;
	identity: Identity;
	updateControllersFn: UpdateControllersFn;
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

	const result = updateControllersFn({ currentControllers, controllerId });

	if (result.result === 'reject' || result.result === 'skip') {
		return result;
	}

	const updateSettings: ICDid.canister_settings = {
		environment_variables: toNullable(),
		compute_allocation: toNullable(),
		freezing_threshold: toNullable(),
		log_visibility: toNullable(),
		memory_allocation: toNullable(),
		reserved_cycles_limit: toNullable(),
		wasm_memory_limit: toNullable(),
		wasm_memory_threshold: toNullable(),
		controllers: toNullable([...currentControllers, controllerId])
	};

	await canisterUpdateSettings({
		canisterId,
		identity,
		settings: updateSettings
	});

	return { result: 'ok' };
};
