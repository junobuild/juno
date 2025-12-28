import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
import {
	requestIcpTransactions,
	requestIcrcTransactions,
	type RequestTransactionsResponse
} from '$lib/services/wallet/wallet.transactions.request.services';
import type { WalletStore } from '$lib/workers/_stores/wallet-worker.store';
import { Principal } from '@icp-sdk/core/principal';

type RequestWorkerTransactionsParams = QueryAndUpdateRequestParams & { store: WalletStore };

export const requestTransactions = async ({
	store,
	...rest
}: RequestWorkerTransactionsParams): Promise<RequestTransactionsResponse> => {
	if (store.ledgerIdText === ICP_LEDGER_CANISTER_ID) {
		return await requestIcpTransactions({
			account: store.account,
			accountIdentifierHex: store.accountIdentifierHex,
			...rest
		});
	}

	return await requestIcrcTransactions({
		account: store.account,
		ledgerId: Principal.fromText(store.ledgerIdText),
		...rest
	});
};
