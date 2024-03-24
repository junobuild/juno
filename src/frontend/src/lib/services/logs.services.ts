import type { canister_log_record } from '$declarations/ic/ic.did';
import type { Doc } from '$declarations/satellite/satellite.did';
import { canisterLogs as canisterLogsApi } from '$lib/api/ic.api';
import { listDocs } from '$lib/api/satellites.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Log, LogDataDid } from '$lib/types/log';
import { fromArray } from '$lib/utils/did.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const listLogs = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{ results?: Log[]; error?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	try {
		const [fnLogs, icLogs] = await Promise.all([
			functionLogs({ satelliteId, identity }),
			canisterLogs({ canisterId: satelliteId, identity })
		]);

		return {
			results: [...fnLogs, ...icLogs].sort(
				({ timestamp: aTimestamp }, { timestamp: bTimestamp }) =>
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

const functionLogs = async (params: {
	satelliteId: Principal;
	identity: Identity;
}): Promise<Log[]> => {
	const { items: fnLogs } = await listDocs({
		collection: '#log',
		params: {
			filter: {},
			order: {
				desc: true,
				field: 'created_at'
			}
		},
		...params
	});

	const mapLog = async ([key, { data, created_at: timestamp }]: [string, Doc]): Promise<Log> => {
		const { message, data: msgData, level }: LogDataDid = await fromArray(data);

		const msgDataArray = fromNullable(msgData);

		return {
			key: `[juno]-${key}`,
			message,
			level:
				'error' in level
					? 'error'
					: 'warning' in level
						? 'warning'
						: 'debug' in level
							? 'debug'
							: 'info',
			timestamp,
			...(nonNullish(msgDataArray) && { data: await fromArray(msgDataArray) })
		};
	};

	return await Promise.all(fnLogs.map(mapLog));
};

const canisterLogs = async (params: {
	canisterId: Principal;
	identity: Identity;
}): Promise<Log[]> => {
	const icLogs = await canisterLogsApi(params);

	const mapLog = async ({
		idx,
		timestamp_nanos: timestamp,
		content
	}: canister_log_record): Promise<Log> => {
		const blob: Blob = new Blob([
			content instanceof Uint8Array ? content : new Uint8Array(content)
		]);

		return {
			key: `[ic]-${idx}`,
			message: await blob.text(),
			level: 'error',
			timestamp
		};
	};

	return await Promise.all(icLogs.map(mapLog));
};
