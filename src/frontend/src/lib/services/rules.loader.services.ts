import { listRules } from '$lib/api/satellites.api';
import { listRules0022, listRulesDeprecated } from '$lib/api/satellites.deprecated.api';
import { filterSystemRules } from '$lib/constants/rules.constants';
import { toasts } from '$lib/stores/toasts.store';
import type { SatelliteDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import type { RulesData } from '$lib/types/rules.context';
import type { Principal } from '@dfinity/principal';
import type { Writable } from 'svelte/store';

export const reloadContextRules = async ({
	satelliteId,
	type,
	store,
	identity
}: {
	satelliteId: Principal;
	store: Writable<RulesData>;
	type: SatelliteDid.CollectionType;
	identity: OptionIdentity;
}) => {
	try {
		const { items: rules } = await listRules({
			satelliteId,
			type,
			filter: {
				...filterSystemRules,
				matcher: [
					{
						include_system: true
					}
				]
			},
			identity
		});
		store.set({ satelliteId, rules, rule: undefined });
	} catch (err: unknown) {
		// TODO: remove backward compatibility stuffs
		try {
			const rules = await listRules0022({ satelliteId, identity, type });
			store.set({ satelliteId, rules, rule: undefined });
			return;
		} catch (_: unknown) {
			// Ignore error of the workaround
		}

		try {
			const rules = await listRulesDeprecated({ satelliteId, identity, type });
			store.set({ satelliteId, rules, rule: undefined });
			return;
		} catch (_: unknown) {
			// Ignore error of the workaround
		}

		store.set({ satelliteId, rules: undefined, rule: undefined });

		toasts.error({
			text: `Error while listing the rules.`,
			detail: err
		});
	}
};
