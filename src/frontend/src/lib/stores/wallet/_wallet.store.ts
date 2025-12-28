import type { IcrcAccountText, LedgerIdText } from '$lib/schemas/wallet.schema';
import type { Option } from '$lib/types/utils';

export type CertifiedWalletStoreData<T> = Option<Record<IcrcAccountText, Record<LedgerIdText, T>>>;
