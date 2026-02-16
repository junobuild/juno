import type { SatelliteDid } from '$declarations';
import { satelliteAuthConfig } from '$lib/derived/satellite/satellite-configs.derived';
import type { AuthConfigContext, AuthConfigData } from '$lib/types/auth.context';
import { nonNullish } from '@dfinity/utils';
import { derived, writable } from 'svelte/store';

export const initAuthConfigContext = (): AuthConfigContext => {
	const store = writable<AuthConfigData>({});

	const config = derived(
		[satelliteAuthConfig],
		([$satelliteAuthConfig]) => $satelliteAuthConfig?.config
	);
	const supportConfig = derived(
		[satelliteAuthConfig],
		([$satelliteAuthConfig]) => $satelliteAuthConfig?.result === 'success'
	);

	const rule = derived([store], ([store]) => store.rule?.rule);
	const supportSettings = derived([store], ([store]) => store.rule?.result === 'success');

	const state = derived([store, satelliteAuthConfig], ([store, $satelliteAuthConfig]) =>
		nonNullish($satelliteAuthConfig) &&
		$satelliteAuthConfig.result !== 'error' &&
		nonNullish(store.rule) &&
		store.rule.result !== 'error'
			? 'initialized'
			: $satelliteAuthConfig?.result === 'error' || store.rule?.result === 'error'
				? 'error'
				: 'loading'
	);

	const setRule = (result: {
		result: 'success' | 'error' | 'skip';
		rule?: SatelliteDid.Rule | undefined;
	}) =>
		store.update((state) => ({
			...state,
			rule: result
		}));

	return {
		setRule,
		config,
		supportConfig,
		rule,
		supportSettings,
		state
	};
};
