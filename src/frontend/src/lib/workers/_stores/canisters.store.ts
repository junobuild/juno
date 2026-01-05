import type { CanisterIdText, CertifiedCanisterSyncData } from '$lib/types/canister';
import { emitCanister } from '$lib/utils/worker.utils';

export class CanistersStore {
	#canisters = new Map<CanisterIdText, CertifiedCanisterSyncData>();

	sync({ canisterId, data }: { canisterId: CanisterIdText; data: CertifiedCanisterSyncData }) {
		this.set({ canisterId, data });

		// We emit the canister data this way the UI can render asynchronously render the information without waiting for all canisters status to be fetched.
		emitCanister(data);
	}

	set({ canisterId, data }: { canisterId: CanisterIdText; data: CertifiedCanisterSyncData }) {
		this.#canisters.set(canisterId, data);
	}

	getValues(): CertifiedCanisterSyncData[] {
		return [...this.#canisters.values()];
	}
}
