import type { CollectionRule } from '$lib/types/collection';
import type { NullishIdentity } from '$lib/types/itentity';
import type { Principal } from '@icp-sdk/core/principal';
import type { Readable, Writable } from 'svelte/store';

export interface RulesData {
	satelliteId: Principal;
	rules: CollectionRule[] | undefined;
	rule: CollectionRule | undefined;
}

export interface RulesContext {
	store: Writable<RulesData>;

	reload: (params: { identity: NullishIdentity }) => Promise<void>;
	init: (params: { satelliteId: Principal; identity: NullishIdentity }) => Promise<void>;

	hasAnyRules: Readable<boolean>;
	emptyRules: Readable<boolean>;
	sortedRules: Readable<CollectionRule[]>;
	devRules: Readable<CollectionRule[]>;
}

export const RULES_CONTEXT_KEY = Symbol('rules');
