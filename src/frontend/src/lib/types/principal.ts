import { PrincipalTextSchema } from '$lib/schema/principal.schema';
import * as z from 'zod';

export type PrincipalText = z.infer<typeof PrincipalTextSchema>;
