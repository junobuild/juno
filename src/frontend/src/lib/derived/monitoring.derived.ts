import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
import {
	missionControlNotMonitored,
	missionControlSettingsLoaded
} from '$lib/derived/mission-control/mission-control-settings.derived';
import { derived } from 'svelte/store';

export const monitoringNotEnabled = derived(
	[missionControlSettingsLoaded, missionControlNotMonitored, missionControlId],
	([$missionControlSettingsLoaded, $missionControlNotMonitored, $missionControlId]) =>
		($missionControlSettingsLoaded && $missionControlNotMonitored) || $missionControlId === null
);
