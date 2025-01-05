import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
import { getOrbiterFee, getSatelliteFee } from '$lib/api/console.api';
import { getMissionControlBalance } from '$lib/services/balance.services';
import {
	createOrbiter,
	createOrbiterWithConfig,
	loadOrbiters
} from '$lib/services/orbiters.services';
import { execute } from '$lib/services/progress.services';
import {
	createSatellite,
	createSatelliteWithConfig,
	loadSatellites
} from '$lib/services/satellites.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity, PrincipalText } from '$lib/types/itentity';
import type { JunoModalCreateSegmentDetail } from '$lib/types/modal';
import type { Option } from '$lib/types/utils';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/wizard';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export interface GetFeeBalance {
	result?: JunoModalCreateSegmentDetail;
	error?: unknown;
}

export const getCreateSatelliteFeeBalance = async (params: {
	identity: OptionIdentity;
	missionControlId: Option<Principal>;
}): Promise<GetFeeBalance> => await getCreateFeeBalance({ ...params, getFee: getSatelliteFee });

export const getCreateOrbiterFeeBalance = async (params: {
	identity: OptionIdentity;
	missionControlId: Option<Principal>;
}): Promise<GetFeeBalance> => await getCreateFeeBalance({ ...params, getFee: getOrbiterFee });

const getCreateFeeBalance = async ({
	identity,
	missionControlId,
	getFee
}: {
	identity: OptionIdentity;
	missionControlId: Option<Principal>;
	getFee: (params: { user: Principal; identity: OptionIdentity }) => Promise<bigint>;
}): Promise<GetFeeBalance> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	const fee = await getFee({ user: identity.getPrincipal(), identity });

	if (fee === 0n) {
		return {
			result: {
				fee
			}
		};
	}

	const { result, error } = await getMissionControlBalance(missionControlId);

	if (nonNullish(error)) {
		return { error };
	}

	if (isNullish(result)) {
		toasts.error({ text: labels.errors.no_mission_control });
		return { error: labels.errors.no_mission_control };
	}

	return {
		result: {
			fee,
			missionControlBalance: {
				...result
			}
		}
	};
};

interface CreateWizardParams {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	subnetId: PrincipalText | undefined;
	onProgress: (progress: WizardCreateProgress | undefined) => void;
}

export const createSatelliteWizard = async ({
	missionControlId,
	identity,
	onProgress,
	subnetId,
	satelliteName
}: CreateWizardParams & {
	satelliteName: string | undefined;
}): Promise<
	| {
			success: 'ok';
			segment: Satellite;
	  }
	| { success: 'error'; err?: unknown }
> => {
	if (isNullish(satelliteName)) {
		toasts.error({
			text: get(i18n).errors.satellite_name_missing
		});
		return { success: 'error' };
	}

	const createFn = async ({ identity }: { identity: Identity }): Promise<Satellite> => {
		const fn = nonNullish(subnetId) ? createSatelliteWithConfig : createSatellite;

		return await fn({
			identity,
			missionControlId,
			config: {
				name: satelliteName,
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});
	};

	return await createWizard({
		identity,
		missionControlId,
		onProgress,
		createFn,
		reloadFn: loadSatellites,
		errorLabel: 'satellite_unexpected_error'
	});
};

export const createOrbiterWizard = async ({
	missionControlId,
	identity,
	onProgress,
	subnetId
}: CreateWizardParams): Promise<
	| {
			success: 'ok';
			segment: Orbiter;
	  }
	| { success: 'error'; err?: unknown }
> => {
	const createFn = async ({ identity }: { identity: Identity }): Promise<Orbiter> => {
		const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

		return await fn({
			identity,
			missionControlId,
			config: {
				...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
			}
		});
	};

	return await createWizard({
		identity,
		missionControlId,
		onProgress,
		createFn,
		reloadFn: loadOrbiters,
		errorLabel: 'orbiter_unexpected_error'
	});
};

const createWizard = async <T>({
	missionControlId,
	identity,
	errorLabel,
	createFn,
	reloadFn,
	onProgress
}: Omit<CreateWizardParams, 'subnetId'> & {
	errorLabel: keyof I18nErrors;
	createFn: (params: { identity: Identity }) => Promise<T>;
	reloadFn: (params: {
		missionControlId: Option<Principal>;
		reload: boolean;
	}) => Promise<{ result: 'skip' | 'success' | 'error' }>;
}): Promise<
	| {
			success: 'ok';
			segment: T;
	  }
	| { success: 'error'; err?: unknown }
> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const fn = async (): Promise<T> =>
			await createFn({
				identity
			});

		const segment = await execute({
			fn,
			onProgress,
			step: WizardCreateProgressStep.Create
		});

		const reload = async () => {
			await reloadFn({ missionControlId, reload: true });
		};

		// Reload list of segments before navigation
		await execute({
			fn: reload,
			onProgress,
			step: WizardCreateProgressStep.Reload
		});

		return { success: 'ok', segment };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors[errorLabel],
			detail: err
		});

		return { success: 'error', err };
	}
};
