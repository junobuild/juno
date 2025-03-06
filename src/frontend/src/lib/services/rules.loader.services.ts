import type { CollectionType } from '$declarations/satellite/satellite.did';
import { listRules } from '$lib/api/satellites.api';
import { listRulesDeprecated } from '$lib/api/satellites.deprecated.api';
import { toasts } from '$lib/stores/toasts.store';
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
	type: CollectionType;
	identity: OptionIdentity;
}) => {
	try {
		const rules = await listRules({ satelliteId, type, identity });
		store.set({ satelliteId, rules, rule: undefined });
	} catch (err: unknown) {
		// TODO: remove backward compatibility stuffs
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
