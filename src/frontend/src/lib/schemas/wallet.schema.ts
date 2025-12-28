import { PrincipalSchema } from '$lib/schemas/principal.schema';
import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

export const IcrcAccountTextSchema = z.string();
export type IcrcAccountText = z.infer<typeof IcrcAccountTextSchema>;

export const LedgerIdTextSchema = PrincipalTextSchema;
export type LedgerIdText = z.infer<typeof LedgerIdTextSchema>;

const LedgerIdSchema = PrincipalSchema;
export type LedgerId = z.infer<typeof LedgerIdSchema>;

const IndexIdSchema = LedgerIdSchema;
export type IndexId = z.infer<typeof IndexIdSchema>;

export const LedgerIdsSchema = z.strictObject({
	ledgerId: LedgerIdSchema,
	indexId: IndexIdSchema
});
export type LedgerIds = z.infer<typeof LedgerIdsSchema>;

export const WalletIdTextSchema = IcrcAccountTextSchema;
export type WalletIdText = IcrcAccountText;

export const WalletIdSchema = z.strictObject({
	owner: PrincipalSchema,
	subaccount: z.instanceof(Uint8Array).optional()
});
export type WalletId = z.infer<typeof WalletIdSchema>;

export const SelectedWalletSchema = z.discriminatedUnion('type', [
	z.strictObject({
		type: z.literal('dev'),
		walletId: WalletIdSchema
	}),
	z.strictObject({
		type: z.literal('mission_control'),
		walletId: WalletIdSchema
	})
]);
export type SelectedWallet = z.infer<typeof SelectedWalletSchema>;
