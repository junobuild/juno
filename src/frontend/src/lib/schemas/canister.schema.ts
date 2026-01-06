import { PrincipalSchema } from '$lib/schemas/principal.schema';
import { PrincipalTextSchema } from '@dfinity/zod-schemas';

export const CanisterIdTextSchema = PrincipalTextSchema;
export const CanisterIdSchema = PrincipalSchema;
