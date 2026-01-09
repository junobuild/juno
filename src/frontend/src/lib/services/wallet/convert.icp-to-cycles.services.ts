import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ConvertIcpProgress } from '$lib/types/progress-convert-icp';

export const convertIcpToCycles = async ({
	identity,
	selectedWallet,
	balance,
	amount,
	onProgress
}: {
	identity: OptionIdentity;
	selectedWallet: SelectedWallet;
	balance: bigint;
	amount: string | undefined;
	onProgress: (progress: ConvertIcpProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {};
