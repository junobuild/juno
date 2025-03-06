import type { Rule } from '$declarations/satellite/satellite.did';
import type { Principal } from '@dfinity/principal';
import type { Writable } from 'svelte/store';

export interface RulesData {
	satelliteId: Principal;
	rules: [string, Rule][] | undefined;
	rule: [string, Rule] | undefined;
}

export interface RulesContext {
	store: Writable<RulesData>;
	reload: () => Promise<void>;
	init: (satelliteId: Principal) => Promise<void>;
}

export const RULES_CONTEXT_KEY = Symbol('rules');
