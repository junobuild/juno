import { getAgent } from '$lib/utils/agent.utils';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import type { Identity } from '@dfinity/agent';
import { AccountIdentifier, LedgerCanister, type BlockHeight } from '@dfinity/ledger-icp';
import type { IcrcAccount } from '@dfinity/ledger-icrc';
import { assertNonNullish, toNullable } from '@dfinity/utils';

export const transfer = async ({
	identity,
	to,
	amount
}: {
	identity: Identity | undefined | null;
	to: string;
	amount: bigint;
}): Promise<BlockHeight> => {
	assertNonNullish(identity);

	const { transfer } = await ledgerCanister(identity);

	console.log(to, amount, identity.getPrincipal().toText());

	return transfer({
		to: AccountIdentifier.fromHex(to),
		amount
	});
};

export const icrc1Transfer = async ({
	identity,
	to,
	amount,
	createdAt
}: {
	identity: Identity | undefined | null;
	to: IcrcAccount;
	amount: bigint;
	createdAt?: bigint;
}): Promise<BlockHeight> => {
	assertNonNullish(identity);

	const { icrc1Transfer } = await ledgerCanister(identity);

	return icrc1Transfer({
		to: {
			owner: to.owner,
			subaccount: toNullable(to.subaccount)
		},
		amount,
		createdAt: createdAt ?? nowInBigIntNanoSeconds()
	});
};

const ledgerCanister = async (identity: Identity): Promise<LedgerCanister> => {
	const agent = await getAgent({ identity });

	return LedgerCanister.create({
		agent
	});
};
