import * as z from 'zod';

export const IcrcAccountTextSchema = z.string();

export type IcrcAccountText = z.infer<typeof IcrcAccountTextSchema>;

export type WalletId = IcrcAccountText;
