import type { IcrcAccountText, LedgerIdText } from '$lib/schemas/wallet.schema';
import type { Nullish } from '@dfinity/zod-schemas';

export type CertifiedWalletStoreData<T> = Nullish<Record<IcrcAccountText, Record<LedgerIdText, T>>>;
