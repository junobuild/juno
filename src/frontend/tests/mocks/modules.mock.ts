import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import { Principal } from '@icp-sdk/core/principal';

export const mockMissionControlId = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');

export const mockSelectedWallet: SelectedWallet = {
	type: 'dev',
	walletId: { owner: mockMissionControlId }
};
