import { Principal } from '@dfinity/principal';
import * as z from 'zod';

export const PrincipalTextSchema = z.string().refine(
	(principal) => {
		try {
			Principal.fromText(principal);
			return true;
		} catch (err: unknown) {
			return false;
		}
	},
	{
		message: 'Invalid textual representation of a Principal.'
	}
);
