import type { CollectionRule } from '$lib/types/collection';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import type { Readable, Writable } from 'svelte/store';

export interface RulesData {
	satelliteId: Principal;
	rules: CollectionRule[] | undefined;
	rule: CollectionRule | undefined;
}

export interface RulesContext {
	store: Writable<RulesData>;

	reload: (params: { identity: OptionIdentity }) => Promise<void>;
	init: (params: { satelliteId: Principal; identity: OptionIdentity }) => Promise<void>;

	hasAnyRules: Readable<boolean>;
	emptyRules: Readable<boolean>;
}

export const RULES_CONTEXT_KEY = Symbol('rules');
