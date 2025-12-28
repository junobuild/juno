import type {
	IcrcAccountText,
	IndexId,
	LedgerId,
	LedgerIds,
	LedgerIdText
} from '$lib/schemas/wallet.schema';
import { walletIdbStore } from '$lib/stores/app/idb.store';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type { CertifiedData } from '$lib/types/store';
import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
import type { AccountIdentifierHex } from '@icp-sdk/canisters/ledger/icp';
import { encodeIcrcAccount, type IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import { get, set } from 'idb-keyval';

export type IndexedTransactions = Record<string, CertifiedData<IcTransactionUi>>;

// Not reactive, only used to hold values imperatively.
interface WalletState {
	balance: CertifiedData<bigint> | undefined;
	transactions: IndexedTransactions;
}

interface WalletTokenAccount {
	account: IcrcAccount;
	ledgerIds: LedgerIds;
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
	#ledgerIds: LedgerIds;

	private constructor({
		state,
		idbKey: key,
		account,
		ledgerIds
	}: {
		state: WalletState | undefined;
		idbKey: WalletIdbKey;
		account: IcrcAccount;
		ledgerIds: LedgerIds;
	}) {
		this.#store = state ?? WalletStore.EMPTY_STORE;
		this.#idbKey = key;
		this.#account = account;
		this.#ledgerIds = ledgerIds;
	}

	get account(): IcrcAccount {
		return this.#account;
	}

	get icrcAccountText(): IcrcAccountText {
		return encodeIcrcAccount(this.#account);
	}

	get accountIdentifierHex(): AccountIdentifierHex {
		return toAccountIdentifier(this.#account).toHex();
	}

	get ledgerIdText(): LedgerIdText {
		const { ledgerId } = this.#ledgerIds;
		return ledgerId.toText();
	}

	get indexId(): IndexId {
		const { indexId } = this.#ledgerIds;
		return indexId;
	}

	get balance(): CertifiedData<bigint> | undefined {
		return this.#store.balance;
	}

	get transactions(): IndexedTransactions {
		return this.#store.transactions;
	}

	get idbKey(): WalletIdbKey {
		return this.#idbKey;
	}

	update({
		balance,
		newTransactions,
		certified
	}: {
		balance: bigint;
		newTransactions: IcTransactionUi[];
		certified: boolean;
	}): void {
		this.#store = {
			balance: { data: balance, certified },
			transactions: {
				...this.#store.transactions,
				...newTransactions.reduce(
					(acc: Record<string, CertifiedData<IcTransactionUi>>, { id, ...transaction }) => ({
						...acc,
						[`${id}`]: {
							data: {
								id,
								...transaction
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
		ledgerId: LedgerId;
		account: IcrcAccount;
	}): string {
		return `${ledgerId.toText()}#${encodeIcrcAccount(account)}`;
	}

	async save(): Promise<void> {
		// Save information to improve UX when application is reloaded or returning users.
		await set(this.#idbKey, this.#store, walletIdbStore);
	}

	static async init({
		account,
		ledgerIds: { ledgerId, indexId }
	}: WalletTokenAccount): Promise<WalletStore> {
		const idbKey = WalletStore.toIdbKey({ account, ledgerId });
		const state = await get(idbKey, walletIdbStore);
		return new WalletStore({ state, idbKey, account, ledgerIds: { ledgerId, indexId } });
	}
}
