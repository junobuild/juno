import { Principal } from '@icp-sdk/core/principal';
import * as z from 'zod';

export const PrincipalObjSchema = z
	.custom<Principal>()
	.refine((principal) => Principal.isPrincipal(principal), {
		error: 'Invalid Principal.'
	})
	.transform((value) => Principal.from(value));

export type PrincipalObj = z.infer<typeof PrincipalObjSchema>;
