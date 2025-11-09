import type { SatelliteDid } from '$declarations';
import type { AuthConfigContext, AuthConfigData } from '$lib/types/auth.context';
import { nonNullish } from '@dfinity/utils';
import { derived, writable } from 'svelte/store';

export const initAuthConfigContext = (): AuthConfigContext => {
	const store = writable<AuthConfigData>({});

	const config = derived([store], ([store]) => store.config?.config);
	const supportConfig = derived([store], ([store]) => store.config?.result === 'success');

	const rule = derived([store], ([store]) => store.rule?.rule);
	const supportSettings = derived([store], ([store]) => store.rule?.result === 'success');

	const state = derived([store], ([store]) =>
		nonNullish(store.config) &&
		store.config.result !== 'error' &&
		nonNullish(store.rule) &&
		store.rule.result !== 'error'
			? 'initialized'
			: store.config?.result === 'error' || store.rule?.result === 'error'
				? 'error'
				: 'loading'
	);

	const setConfig = (result: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AuthenticationConfig | undefined;
	}) =>
		store.update((state) => ({
			...state,
			config: result
		}));

	const setRule = (result: {
		result: 'success' | 'error' | 'skip';
		rule?: SatelliteDid.Rule | undefined;
	}) =>
		store.update((state) => ({
			...state,
			rule: result
		}));

	return {
		setConfig,
		setRule,
		config,
		supportConfig,
		rule,
		supportSettings,
		state
	};
};
