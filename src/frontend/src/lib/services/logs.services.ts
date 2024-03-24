import type { canister_log_record } from '$declarations/ic/ic.did';
import { canisterLogs as canisterLogsApi } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Log } from '$lib/types/log';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const listLogs = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: OptionIdentity;
}): Promise<{ results?: Log[]; error?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	try {
		const [icLogs] = await Promise.all([canisterLogs({ canisterId, identity })]);

		return {
			results: icLogs.sort(({ timestamp: aTimestamp }, { timestamp: bTimestamp }) =>
				aTimestamp > bTimestamp ? -1 : aTimestamp === bTimestamp ? 0 : 1
			)
		};
	} catch (error: unknown) {
		toasts.error({
			text: `Cannot fetch logs.`,
			detail: error
		});

		return { error };
	}
};

const canisterLogs = async (params: {
	canisterId: Principal;
	identity: Identity;
}): Promise<Log[]> => {
	const icLogs = await canisterLogsApi(params);

	const mapLog = async ({
		timestamp_nanos: timestamp,
		content
	}: canister_log_record): Promise<Log> => {
		const blob: Blob = new Blob([
			content instanceof Uint8Array ? content : new Uint8Array(content)
		]);

		return {
			message: await blob.text(),
			level: 'error',
			timestamp
		};
	};

	return await Promise.all(icLogs.map(mapLog));
};
