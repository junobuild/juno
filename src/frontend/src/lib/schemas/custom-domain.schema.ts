import * as z from 'zod';

export const CustomDomainStateSchema = z.enum(['registering', 'registered', 'expired', 'failed']);
