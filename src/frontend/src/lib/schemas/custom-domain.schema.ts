import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

export const CustomDomainStateSchema = z.enum(['registering', 'registered', 'expired', 'failed']);

const CustomDomainResponseStatusSchema = z.enum(['success', 'error']);

const CustomDomainResponseDataSchema = z.strictObject({
	domain: z.string(),
	canister_id: PrincipalTextSchema.optional()
});

const CustomDomainResponseErrorSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['error']),
	message: z.string(),
	data: CustomDomainResponseDataSchema.omit({ canister_id: true }),
	errors: z.string()
});

// GET BN_API/{domain}/validate

const CustomDomainResponseValidationErrorSchema = CustomDomainResponseErrorSchema;

const CustomDomainResponseValidationStatusSchema = z.enum(['valid']);

const CustomDomainResponseValidationSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataSchema.extend({
		validation_status: CustomDomainResponseValidationStatusSchema
	})
});

export const CustomDomainResponseValidationSchema = CustomDomainResponseValidationSuccessSchema.or(
	CustomDomainResponseValidationErrorSchema
);

// GET BN_API/{domain}

const CustomDomainResponseGetErrorSchema = CustomDomainResponseErrorSchema;

const CustomDomainResponseRegistrationStatusSchema = z.enum(['registering', 'registered', 'expired', 'failed']);

const CustomDomainResponseGetSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataSchema.required().extend({
		registration_status: CustomDomainResponseRegistrationStatusSchema
	})
});

export const CustomDomainResponseGetSchema = CustomDomainResponseGetSuccessSchema.or(
	CustomDomainResponseGetErrorSchema
);