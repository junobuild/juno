import type { SatelliteDid } from '$declarations';
import { reloadContextRules } from '$lib/services/satellite/collection/rules.loader.services';
import type { NullishIdentity } from '$lib/types/itentity';
import type { RulesContext, RulesData } from '$lib/types/rules.context';
import type { Principal } from '@icp-sdk/core/principal';
import { derived, get, writable } from 'svelte/store';

export const initRulesContext = ({
	satelliteId: initialSatelliteId,
	type
}: {
	satelliteId: Principal;
	type: SatelliteDid.CollectionType;
}): RulesContext => {
	const store = writable<RulesData>({
		satelliteId: initialSatelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async ({ identity }: { identity: NullishIdentity }) =>
		await reloadContextRules({
			satelliteId: get(store).satelliteId,
			type,
			store,
			identity
		});

	const initRules = async ({
		satelliteId,
		identity
	}: {
		satelliteId: Principal;
		identity: NullishIdentity;
	}) => {
		store.set({
			satelliteId,
			rules: undefined,
			rule: undefined
		});

		await reloadRules({ identity });
	};

	const sortedRules = derived(store, ({ rules }) =>
		(rules ?? []).sort(([collectionA, _], [collectionB, __]) =>
			collectionA.localeCompare(collectionB)
		)
	);

	const devRules = derived(sortedRules, (rules) =>
		rules.filter(([key, _]) => !key.startsWith('#'))
	);

	const hasAnyRules = derived(devRules, (rules) => (rules?.length ?? 0) > 0);

	const emptyRules = derived(hasAnyRules, (hasAnyRules) => !hasAnyRules);

	return {
		store,
		reload: reloadRules,
		init: initRules,
		hasAnyRules,
		emptyRules,
		sortedRules,
		devRules
	};
};
