import type { CanisterStoreData } from '$lib/stores/_canister.store';
import {
	canisterMonitoringUncertifiedStore,
	canistersMonitoringUncertifiedStore,
	type UncertifiedCanisterSyncMonitoring
} from '$lib/stores/canister-monitoring.store';
import {
	canistersSyncDataUncertifiedStore,
	canisterSyncDataUncertifiedStore,
	type UncertifiedCanisterSyncData
} from '$lib/stores/canister-sync-data.store';
import type {
	PostMessageDataResponseCanisterMonitoring,
	PostMessageDataResponseCanistersMonitoring,
	PostMessageDataResponseCanistersSyncData,
	PostMessageDataResponseCanisterSyncData
} from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';

export const syncCanisterMonitoring = ({ canister }: PostMessageDataResponseCanisterMonitoring) => {
	if (isNullish(canister)) {
		return;
	}

	canisterMonitoringUncertifiedStore.set({
		canisterId: canister.id,
		data: {
			data: canister,
			certified: false
		}
	});
};

export const syncCanistersMonitoring = ({
	canisters
}: PostMessageDataResponseCanistersMonitoring) => {
	if (isNullish(canisters)) {
		return;
	}

	const state = canisters.reduce<CanisterStoreData<UncertifiedCanisterSyncMonitoring>>(
		(acc, canister) => ({
			...acc,
			[canister.id]: {
				data: canister,
				certified: false
			}
		}),
		{}
	);

	canistersMonitoringUncertifiedStore.setAll(state);
};

export const syncCanisterSyncData = ({ canister }: PostMessageDataResponseCanisterSyncData) => {
	if (isNullish(canister)) {
		return;
	}

	canisterSyncDataUncertifiedStore.set({
		canisterId: canister.id,
		data: {
			data: canister,
			certified: false
		}
	});
};

export const syncCanistersSyncData = ({ canisters }: PostMessageDataResponseCanistersSyncData) => {
	if (isNullish(canisters)) {
		return;
	}

	const state = canisters.reduce<CanisterStoreData<UncertifiedCanisterSyncData>>(
		(acc, canister) => ({
			...acc,
			[canister.id]: {
				data: canister,
				certified: false
			}
		}),
		{}
	);

	canistersSyncDataUncertifiedStore.setAll(state);
};
