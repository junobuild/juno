import { derived } from 'svelte/store';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';

export const githubConfig = derived([satelliteAutomationConfig], ([$satelliteAutomationConfig]) => {
	// Undefined not loaded or null as set as such
	if (isNullish($satelliteAutomationConfig)) {
		return $satelliteAutomationConfig;
	}

	const openid = fromNullable($satelliteAutomationConfig.openid);
	const github = openid?.providers.find(([key]) => 'GitHub' in key);
	return github?.[1] ?? null;
});