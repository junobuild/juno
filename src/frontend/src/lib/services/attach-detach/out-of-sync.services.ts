import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const reconcileSegments = async ({
	identity,
	missionControlId
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
}): Promise<{ result: 'ok' } | { result: 'error'; err?: unknown }> => {
	// TODO: duplicate code
	if (missionControlId === undefined) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return { result: 'error' };
	}

	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	if (missionControlId === null) {
		toasts.warn(get(i18n).errors.mission_control_not_found);
		return { result: 'error' };
	}

	try {
		// TODO:

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.reconcile_out_of_sync_error,
			detail: err
		});

		return { result: 'error', err };
	}
};
