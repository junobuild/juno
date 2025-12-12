import type { IcrcAccountText } from '$lib/schemas/wallet.schema';
import { walletIdbStore } from '$lib/stores/app/idb.store';
import type { CertifiedData } from '$lib/types/store';
import type { PrincipalText } from '@dfinity/zod-schemas';
import type { IcpIndexDid } from '@icp-sdk/canisters/ledger/icp';
import { encodeIcrcAccount, type IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { get, set } from 'idb-keyval';

export type IndexedTransactions = Record<string, CertifiedData<IcpIndexDid.TransactionWithId>>;

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
	#account: IcrcAccount;

	private constructor({
		state,
		idbKey: key,
		account
	}: {
		state: WalletState | undefined;
		idbKey: WalletIdbKey;
		account: IcrcAccount;
	}) {
		this.#store = state ?? WalletStore.EMPTY_STORE;
		this.#idbKey = key;
		this.#account = account;
	}

	get accountText(): IcrcAccountText {
		return encodeIcrcAccount(this.#account);
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
		newTransactions: IcpIndexDid.TransactionWithId[];
		certified: boolean;
	}): void {
		this.#store = {
			balance: { data: balance, certified },
			transactions: {
				...this.#store.transactions,
				...newTransactions.reduce(
					(
						acc: Record<string, CertifiedData<IcpIndexDid.TransactionWithId>>,
						{ id, transaction }
					) => ({
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

	static async init({ account, ledgerId }: WalletTokenAccount): Promise<WalletStore> {
		const idbKey = WalletStore.toIdbKey({ account, ledgerId });
		const state = await get(idbKey, walletIdbStore);
		return new WalletStore({ state, idbKey, account });
	}
}
