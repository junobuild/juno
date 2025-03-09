import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type { CertifiedData } from '$lib/types/store';

export type CertifiedTransaction = CertifiedData<IcTransactionUi>;

export type CertifiedTransactions = CertifiedTransaction[];
