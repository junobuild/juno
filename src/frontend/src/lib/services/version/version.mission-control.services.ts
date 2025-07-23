import { missionControlVersionNotLoaded } from '$lib/derived/version.derived';
import { reloadVersion } from '$lib/services/version/_version.reload.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { MissionControlId } from '$lib/types/mission-control';
import { waitReady } from '$lib/utils/timeout.utils';
import { get } from 'svelte/store';

export const reloadMissionControlVersion = async ({
	missionControlId
}: {
	missionControlId: MissionControlId;
}) => {
	await reloadVersion({
		canisterId: missionControlId
	});
};

export const waitMissionControlVersionLoaded = async (): Promise<{
	result: 'loaded' | 'error';
}> => {
	const result = await waitReady({
		isDisabled: () => get(missionControlVersionNotLoaded)
	});

	if (result === 'ready') {
		return { result: 'loaded' };
	}

	const labels = get(i18n);

	toasts.error({
		text: labels.errors.load_version_timeout
	});

	return { result: 'error' };
};
