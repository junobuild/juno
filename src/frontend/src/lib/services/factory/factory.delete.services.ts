import { canisterDelete, canisterStop } from '$lib/api/ic.api';
import { depositCycles as depositCyclesOrbiterApi } from '$lib/api/orbiter.api';
import { depositCycles as depositCyclesSatellitesApi } from '$lib/api/satellites.api';
import { execute } from '$lib/services/_progress.services';
import { detachSegment } from '$lib/services/attach-detach/detach.services';
import { loadSegments } from '$lib/services/segments.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import {
	type FactoryDeleteProgress,
	FactoryDeleteProgressStep
} from '$lib/types/progress-factory-delete';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface DeleteWizardParams {
	segmentId: Principal;
	segment: 'satellite' | 'orbiter';
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	cyclesToDeposit: bigint;
	canisterIdForDeposit: Principal;
	monitoringEnabled: boolean;
	onProgress: (progress: FactoryDeleteProgress | undefined) => void;
}

type DeleteWizardResult = Promise<
	| {
			result: 'ok' | 'warn';
	  }
	| { result: 'error'; err?: unknown }
>;

const buildOrbiterDepositCyclesFn = ({
	canisterIdForDeposit,
	cyclesToDeposit,
	segmentId
}: Pick<
	DeleteWizardParams,
	'segmentId' | 'canisterIdForDeposit' | 'cyclesToDeposit'
>): DepositCyclesFn => {
	const depositCyclesFn: DepositCyclesFn = async ({ identity }) => {
		await depositCyclesOrbiterApi({
			orbiterId: segmentId,
			cycles: cyclesToDeposit,
			destinationId: canisterIdForDeposit,
			identity
		});
	};

	return depositCyclesFn;
};

const buildSatelliteDepositCyclesFn = ({
	canisterIdForDeposit,
	cyclesToDeposit,
	segmentId
}: Pick<
	DeleteWizardParams,
	'segmentId' | 'canisterIdForDeposit' | 'cyclesToDeposit'
>): DepositCyclesFn => {
	const depositCyclesFn: DepositCyclesFn = async ({ identity }) => {
		await depositCyclesSatellitesApi({
			satelliteId: segmentId,
			cycles: cyclesToDeposit,
			destinationId: canisterIdForDeposit,
			identity
		});
	};

	return depositCyclesFn;
};

type DepositCyclesFn = (params: { identity: Identity }) => Promise<void>;

export const deleteSegmentWizard = async ({
	missionControlId,
	identity,
	onProgress,
	segmentId,
	monitoringEnabled,
	segment,
	canisterIdForDeposit,
	cyclesToDeposit
}: DeleteWizardParams): Promise<DeleteWizardResult> => {
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

	// TODO: duplicate code
	// TODO: can be removed once the mission control is patched to disable monitoring on detach
	if (monitoringEnabled) {
		toasts.warn(get(i18n).monitoring.warn_monitoring_enabled);
		return { result: 'warn' };
	}

	try {
		// 1. deposit_cycles to move out the cycles the devs want to keep
		const depositFn = async () => {
			const buildDepositCyclesFn =
				segment === 'orbiter' ? buildSatelliteDepositCyclesFn : buildSatelliteDepositCyclesFn;

			const depositCyclesFn = buildDepositCyclesFn({
				canisterIdForDeposit,
				cyclesToDeposit,
				segmentId
			});

			await depositCyclesFn({ identity });
		};

		await execute({
			fn: depositFn,
			onProgress,
			step: FactoryDeleteProgressStep.Deposit
		});

		// 2. stop_segment (IC stop_canister)
		const stop = async () => {
			await canisterStop({ identity, canisterId: segmentId });
		};

		await execute({
			fn: stop,
			onProgress,
			step: FactoryDeleteProgressStep.StoppingCanister
		});

		// 3. delete_segment (IC delete_canister)
		const deleteCanister = async () => {
			await canisterDelete({ identity, canisterId: segmentId });
		};

		await execute({
			fn: deleteCanister,
			onProgress,
			step: FactoryDeleteProgressStep.DeletingCanister
		});

		// 4. unset
		const unset = async () => {
			await detachSegment({
				segment,
				missionControlId,
				identity,
				segmentId,
				// Can only be false here
				monitoringEnabled
			});
		};

		await execute({
			fn: unset,
			onProgress,
			step: FactoryDeleteProgressStep.Detaching
		});

		// 5. Reload the list of segments
		const reload = async () => {
			await loadSegments({
				missionControlId,
				reload: true,
				reloadSatellites: segment === 'satellite',
				reloadOrbiters: segment === 'orbiter'
			});
		};

		await execute({
			fn: reload,
			onProgress,
			step: FactoryDeleteProgressStep.Reload
		});

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.canister_delete,
			detail: err
		});

		return { result: 'error', err };
	}
};
