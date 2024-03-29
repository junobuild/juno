import type { canister_log_record } from '$declarations/ic/ic.did';
import type { Doc } from '$declarations/satellite/satellite.did';
import { canisterLogs as canisterLogsApi } from '$lib/api/ic.api';
import { listDocs } from '$lib/api/satellites.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Log, LogDataDid, LogLevel } from '$lib/types/log';
import { fromArray } from '$lib/utils/did.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const listLogs = async ({
	satelliteId,
	identity,
	desc = true,
	levels = ['Info', 'Debug', 'Warning', 'Error']
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
	desc?: boolean;
	levels?: LogLevel[];
}): Promise<{ results?: [string, Log][]; error?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { error: 'No identity provided' };
	}

	try {
		const [fnLogs] = await Promise.all([
			functionLogs({ satelliteId, identity })
			// TODO: IC logs are not available on mainnet yet
			// canisterLogs({ canisterId: satelliteId, identity })
		]);

		return {
			results: [...fnLogs]
				.filter(([_, { level }]) => levels.includes(level))
				.sort(([, { timestamp: aTimestamp }], [_, { timestamp: bTimestamp }]) =>
					aTimestamp > bTimestamp ? (desc ? -1 : 1) : aTimestamp === bTimestamp ? 0 : desc ? 1 : -1
				)
		};
	} catch (error: unknown) {
		toasts.error({
			text: labels.errors.cannot_fetch_logs,
			detail: error
		});

		return { error };
	}
};

const functionLogs = async (params: {
	satelliteId: Principal;
	identity: Identity;
}): Promise<[string, Log][]> => {
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

	const mapLog = async ([key, { data, created_at: timestamp }]: [string, Doc]): Promise<
		[string, Log]
	> => {
		const { message, data: msgData, level }: LogDataDid = await fromArray(data);

		return [
			`[juno]-${key}`,
			{
				message,
				level,
				timestamp,
				...(nonNullish(msgData) && { data: await fromArray(msgData) })
			}
		];
	};

	return await Promise.all(fnLogs.map(mapLog));
};

const canisterLogs = async (params: {
	canisterId: Principal;
	identity: Identity;
}): Promise<[string, Log][]> => {
	const icLogs = await canisterLogsApi(params);

	const mapLog = async ({
		idx,
		timestamp_nanos: timestamp,
		content
	}: canister_log_record): Promise<[string, Log]> => {
		const blob: Blob = new Blob([
			content instanceof Uint8Array ? content : new Uint8Array(content)
		]);

		return [
			`[ic]-${idx}`,
			{
				message: await blob.text(),
				level: 'Error',
				timestamp
			}
		];
	};

	return await Promise.all(icLogs.map(mapLog));
};
