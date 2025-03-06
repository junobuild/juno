import type { CollectionType } from '$declarations/satellite/satellite.did';
import { DbCollectionType } from '$lib/constants/rules.constants';
import { authStore } from '$lib/stores/auth.store';
import type { RulesContext, RulesData } from '$lib/types/rules.context';
import { reloadContextRules } from '$lib/utils/rules.utils';
import type { Principal } from '@dfinity/principal';
import { get, writable } from 'svelte/store';

export const initRulesContext = ({
	satelliteId,
	type
}: {
	satelliteId: Principal;
	type: CollectionType;
}): RulesContext => {
	const store = writable<RulesData>({
		satelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async () =>
		await reloadContextRules({
			satelliteId,
			type,
			store,
			// TODO: pass auth as argument
			identity: get(authStore).identity
		});

	return {
		store,
		reload: reloadRules
	};
};
