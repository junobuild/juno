import { type ICDid , type ICActor, idlFactoryIC } from '$declarations';
import type { Identity } from '@dfinity/agent';
import type { PocketIc } from '@dfinity/pic';
import { Principal } from '@dfinity/principal';

export interface IcMgmtLog {
	message: string;
	timestamp: bigint;
}

export const fetchLogs = async ({
	pic,
	controller,
	canisterId
}: {
	pic: PocketIc;
	controller: Identity;
	canisterId: Principal;
}): Promise<[string, IcMgmtLog][]> => {
	const mgmtActor = pic.createActor<ICActor>(idlFactoryIC, Principal.fromText('aaaaa-aa'));
	mgmtActor.setIdentity(controller);

	const { fetch_canister_logs } = mgmtActor;

	const { canister_log_records: logs } = await fetch_canister_logs({ canister_id: canisterId });

	const mapLog = async ({
		idx,
		timestamp_nanos: timestamp,
		content
	}: ICDid.canister_log_record): Promise<[string, IcMgmtLog]> => {
		const blob: Blob = new Blob([
			content instanceof Uint8Array ? content : new Uint8Array(content)
		]);

		return [
			`[ic]-${idx}`,
			{
				message: await blob.text(),
				timestamp
			}
		];
	};

	return await Promise.all(logs.map(mapLog));
};
