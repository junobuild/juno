import { walletIdbStore } from '$lib/stores/idb.store';
import type { PrincipalText } from '$lib/types/principal';
import type { CertifiedData } from '$lib/types/store';
import type { TransactionWithId } from '@dfinity/ledger-icp';
import { encodeIcrcAccount, type IcrcAccount } from '@dfinity/ledger-icrc';
import { get, set } from 'idb-keyval';

export type IndexedTransactions = Record<string, CertifiedData<TransactionWithId>>;

// Not reactive, only used to hold values imperatively.
interface WalletState {
	balance: CertifiedData<bigint> | undefined;
	transactions: IndexedTransactions;
}

interface WalletTokenAccount {
	ledgerId: PrincipalText;
	account: IcrcAccount;
}

type WalletIdbKey = string;

export class WalletStore {
	private static EMPTY_STORE: WalletState = {
		balance: undefined,
		transactions: {}
	};

	#store: WalletState;
	#idbKey: WalletIdbKey;

	private constructor({
		state,
		idbKey: key
	}: {
		state: WalletState | undefined;
		idbKey: WalletIdbKey;
	}) {
		this.#store = state ?? WalletStore.EMPTY_STORE;
		this.#idbKey = key;
	}

	get balance(): CertifiedData<bigint> | undefined {
		return this.#store.balance;
	}

	get transactions(): IndexedTransactions {
		return this.#store.transactions;
	}

	update({
		balance,
		newTransactions,
		certified
	}: {
		balance: bigint;
		newTransactions: TransactionWithId[];
		certified: boolean;
	}): void {
		this.#store = {
			balance: { data: balance, certified },
			transactions: {
				...this.#store.transactions,
				...newTransactions.reduce(
					(acc: Record<string, CertifiedData<TransactionWithId>>, { id, transaction }) => ({
						...acc,
						[`${id}`]: {
							data: {
								id,
								transaction
							},
							certified
						}
					}),
					{}
				)
			}
		};
	}

	clean(certifiedTransactions: IndexedTransactions) {
		this.#store = {
			...this.#store,
			transactions: {
				...certifiedTransactions
			}
		};
	}

	reset() {
		this.#store = WalletStore.EMPTY_STORE;
	}

	private static toIdbKey({
		account,
		ledgerId
	}: {
		ledgerId: PrincipalText;
		account: IcrcAccount;
	}): string {
		return `${ledgerId}#${encodeIcrcAccount(account)}`;
	}

	async save(): Promise<void> {
		// Save information to improve UX when application is reloaded or returning users.
		await set(this.#idbKey, this.#store, walletIdbStore);
	}

	static async init(params: WalletTokenAccount): Promise<WalletStore> {
		const idbKey = WalletStore.toIdbKey(params);
		const state = await get(idbKey, walletIdbStore);
		return new WalletStore({ state, idbKey });
	}
}
