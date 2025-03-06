import type { CollectionType } from '$declarations/satellite/satellite.did';
import { reloadContextRules } from '$lib/services/rules.loader.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { RulesContext, RulesData } from '$lib/types/rules.context';
import type { Principal } from '@dfinity/principal';
import { derived, get, writable } from 'svelte/store';

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

	const reloadRules = async ({ identity }: { identity: OptionIdentity }) =>
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
		identity: OptionIdentity;
	}) => {
		store.set({
			satelliteId,
			rules: undefined,
			rule: undefined
		});

		await reloadRules({ identity });
	};

	const hasAnyRules = derived(store, ({ rules }) => (rules?.length ?? 0) > 0);

	const emptyRules = derived(hasAnyRules, (hasAnyRules) => !hasAnyRules);

	return {
		store,
		reload: reloadRules,
		init: initRules,
		hasAnyRules,
		emptyRules
	};
};
