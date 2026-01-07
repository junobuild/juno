import type { CanisterStoreData } from '$lib/stores/_canister.store';
import type { CertifiedCanisterStoreData } from '$lib/stores/_certified-canister.store';
import {
	canistersSyncDataStore,
	canisterSyncDataStore
} from '$lib/stores/ic-mgmt/canister-sync-data.store';
import {
	canisterMonitoringUncertifiedStore,
	canistersMonitoringUncertifiedStore
} from '$lib/stores/mission-control/canister-monitoring.store';
import type { CanisterSyncData, UncertifiedCanisterSyncMonitoring } from '$lib/types/canister';
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

	const {
		data: { id: canisterId }
	} = canister;

	canisterMonitoringUncertifiedStore.set({
		canisterId,
		data: canister
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
			[canister.data.id]: canister
		}),
		{}
	);

	canistersMonitoringUncertifiedStore.setAll(state);
};

export const syncCanisterSyncData = ({ canister }: PostMessageDataResponseCanisterSyncData) => {
	if (isNullish(canister)) {
		return;
	}

	const {
		data: { id: canisterId }
	} = canister;

	canisterSyncDataStore.set({
		canisterId,
		data: canister
	});
};

export const syncCanistersSyncData = ({ canisters }: PostMessageDataResponseCanistersSyncData) => {
	if (isNullish(canisters)) {
		return;
	}

	const state = canisters.reduce<CertifiedCanisterStoreData<CanisterSyncData>>(
		(acc, canister) => ({
			...acc,
			[canister.data.id]: canister
		}),
		{}
	);

	canistersSyncDataStore.setAll(state);
};
