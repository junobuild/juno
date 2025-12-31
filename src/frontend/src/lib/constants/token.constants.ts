import {
	CYCLES_INDEX_CANISTER_ID,
	CYCLES_LEDGER_CANISTER_ID,
	ICP_INDEX_CANISTER_ID,
	ICP_LEDGER_CANISTER_ID
} from '$lib/constants/app.constants';
import type { SelectedToken } from '$lib/schemas/wallet.schema';
import { ICPToken, type Token } from '@dfinity/utils';

export const CyclesToken: Token = {
	symbol: 'TCYCLES',
	name: 'Trillion Cycles',
	decimals: 12
};

export const ICP_TRANSACTION_FEE = 10_000n;
export const ICP_TOP_UP_FEE = 2n * ICP_TRANSACTION_FEE;
export const CYCLES_TRANSACTION_FEE = 100_000_000n;
export const CYCLES_TOP_UP_FEE = CYCLES_TRANSACTION_FEE;

export const CYCLES: SelectedToken = {
	token: CyclesToken,
	fees: {
		transaction: CYCLES_TRANSACTION_FEE,
		topUp: CYCLES_TOP_UP_FEE
	},
	ledgerId: CYCLES_LEDGER_CANISTER_ID,
	indexId: CYCLES_INDEX_CANISTER_ID
};

export const ICP: SelectedToken = {
	token: ICPToken,
	fees: {
		transaction: ICP_TRANSACTION_FEE,
		topUp: ICP_TOP_UP_FEE
	},
	ledgerId: ICP_LEDGER_CANISTER_ID,
	indexId: ICP_INDEX_CANISTER_ID
};
