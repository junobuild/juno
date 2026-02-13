import type { SatelliteDid } from '$declarations';
import type { AutomationConfigContext, AutomationConfigData } from '$lib/types/automation.context';
import { nonNullish } from '@dfinity/utils';
import { derived, writable } from 'svelte/store';

export const initAutomationConfigContext = (): AutomationConfigContext => {
	const store = writable<AutomationConfigData>({});

	const config = derived([store], ([store]) => store.config?.config);
	const supportConfig = derived([store], ([store]) => store.config?.result === 'success');

	const state = derived([store], ([store]) =>
		nonNullish(store.config) && store.config.result !== 'error'
			? 'initialized'
			: store.config?.result === 'error'
				? 'error'
				: 'loading'
	);

	const setConfig = (result: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AutomationConfig | undefined;
	}) =>
		store.update((state) => ({
			...state,
			config: result
		}));

	return {
		setConfig,
		config,
		supportConfig,
		state
	};
};
