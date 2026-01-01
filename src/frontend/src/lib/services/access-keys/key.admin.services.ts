import type { ICDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { MAX_NUMBER_OF_SATELLITE_CONTROLLERS } from '$lib/constants/canister.constants';
import { i18n } from '$lib/stores/app/i18n.store';
import type { AddAdminAccessKeyParams } from '$lib/types/access-keys';
import { toSetController } from '$lib/utils/controllers.utils';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import type { OrbiterDid, SatelliteDid } from '@junobuild/ic-client/actor';
import { get } from 'svelte/store';

interface SetAccessKeysFnParams {
	args: SatelliteDid.SetControllersArgs | OrbiterDid.SetControllersArgs;
}

export type SetAccessKeysFn = (params: SetAccessKeysFnParams) => Promise<void>;

export type SetAdminAccessKeyResult =
	| { result: 'ok' | 'skip' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };

export const setAdminAccessKey = async ({
	setAccessKeysFn,
	attachFn,
	canisterId,
	accessKeyId: controllerIdParam,
	profile,
	identity
}: {
	setAccessKeysFn: SetAccessKeysFn;
	attachFn?: () => Promise<void>;
	canisterId: Principal;
	identity: Identity;
} & AddAdminAccessKeyParams): Promise<SetAdminAccessKeyResult> => {
	try {
		const controllerId = Principal.isPrincipal(controllerIdParam)
			? controllerIdParam
			: Principal.fromText(controllerIdParam);

		const result = await setIcMgmtController({
			controllerId,
			identity,
			canisterId
		});

		if (result.result === 'reject') {
			return result;
		}

		await setAccessKeysFn({
			args: {
				controller: toSetController({
					profile,
					scope: 'admin'
				}),
				controllers: [controllerId]
			}
		});

		await attachFn?.();

		return { result: 'ok' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

const setIcMgmtController = async ({
	canisterId,
	controllerId,
	identity
}: {
	canisterId: Principal;
	controllerId: Principal;
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

	if (currentControllers.length >= MAX_NUMBER_OF_SATELLITE_CONTROLLERS - 1) {
		return { result: 'reject', reason: get(i18n).errors.canister_controllers };
	}

	const alreadySet =
		currentControllers.find((id) => id.toText() === canisterId.toText()) !== undefined;
	if (alreadySet) {
		return { result: 'skip' };
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
