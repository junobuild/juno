import { initCanisterStore } from '$lib/stores/_canister.store';
import type { CertifiedData } from '$lib/types/store';

export const balanceCertifiedStore = initCanisterStore<CertifiedData<bigint>>();
