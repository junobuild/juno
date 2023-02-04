import type { Rule } from '$declarations/satellite/satellite.did';
import type { Principal } from '@dfinity/principal';
import type { Writable } from 'svelte/store';

export interface RulesStore {
	satelliteId: Principal;
	rules: [string, Rule][] | undefined;
	rule: [string, Rule] | undefined;
}

export interface RulesContext {
	store: Writable<RulesStore>;
	reload: () => Promise<void>;
}

export const RULES_CONTEXT_KEY = Symbol('rules');
