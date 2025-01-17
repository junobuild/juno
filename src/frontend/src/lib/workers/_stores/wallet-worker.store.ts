import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/constants';
import { walletIdbStore } from '$lib/stores/idb.store';
import type { CertifiedData } from '$lib/types/store';
import type { TransactionWithId } from '@dfinity/ledger-icp';
import { get, set } from 'idb-keyval';

export type IndexedTransactions = Record<string, CertifiedData<TransactionWithId>>;

// Not reactive, only used to hold values imperatively.
interface WalletState {
	balance: CertifiedData<bigint> | undefined;
	transactions: IndexedTransactions;
}

export class WalletStore {
	private static EMPTY_STORE: WalletState = {
		balance: undefined,
		transactions: {}
	};

	#store: WalletState;

	private constructor(state: WalletState) {
		this.#store = state ?? WalletStore.EMPTY_STORE;
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

	async save(): Promise<void> {
		// Save information to improve UX when application is reloaded or returning users.
		await set(ICP_LEDGER_CANISTER_ID, this.#store, walletIdbStore);
	}

	static async init(): Promise<WalletStore> {
		const state = await get(ICP_LEDGER_CANISTER_ID, walletIdbStore);
		return new WalletStore(state);
	}
}
