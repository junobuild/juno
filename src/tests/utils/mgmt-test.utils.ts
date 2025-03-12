import type { _SERVICE as IcActor, canister_log_record } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIc } from '$declarations/ic/ic.factory.did';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { PocketIc } from '@hadronous/pic';

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
	const mgmtActor = pic.createActor<IcActor>(idlFactorIc, Principal.fromText('aaaaa-aa'));
	mgmtActor.setIdentity(controller);

	const { fetch_canister_logs } = mgmtActor;

	const { canister_log_records: logs } = await fetch_canister_logs({ canister_id: canisterId });

	const mapLog = async ({
		idx,
		timestamp_nanos: timestamp,
		content
	}: canister_log_record): Promise<[string, IcMgmtLog]> => {
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
