import type { CollectionType } from '$declarations/satellite/satellite.did';
import { authStore } from '$lib/stores/auth.store';
import type { RulesContext, RulesData } from '$lib/types/rules.context';
import { reloadContextRules } from '$lib/utils/rules.utils';
import type { Principal } from '@dfinity/principal';
import { get, writable } from 'svelte/store';

export const initRulesContext = ({
	satelliteId: initialSatelliteId,
	type
}: {
	satelliteId: Principal;
	type: CollectionType;
}): RulesContext => {
	const store = writable<RulesData>({
		satelliteId: initialSatelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async () =>
		await reloadContextRules({
			satelliteId: get(store).satelliteId,
			type,
			store,
			// TODO: pass auth as argument
			identity: get(authStore).identity
		});

	const initRules = async (satelliteId: Principal) => {
		store.set({
			satelliteId,
			rules: undefined,
			rule: undefined
		});

		await reloadRules();
	};

	return {
		store,
		reload: reloadRules,
		init: initRules
	};
};
