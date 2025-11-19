import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

// App and BN

export const CustomDomainStateSchema = z.enum(['registering', 'registered', 'expired', 'failed']);

// BN

const CustomDomainResponseStatusSchema = z.enum(['success', 'error']);

const CustomDomainResponseDataSchema = z.strictObject({
	domain: z.string()
});

const CustomDomainResponseDataWithCanisterIdSchema = z.strictObject({
	...CustomDomainResponseDataSchema.shape,
	canister_id: PrincipalTextSchema
});

const CustomDomainResponseDataWithNullableCanisterIdSchema = z.strictObject({
	...CustomDomainResponseDataSchema.shape,
	canister_id: PrincipalTextSchema.nullish()
});

const CustomDomainResponseErrorSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['error']),
	message: z.string(),
	data: CustomDomainResponseDataSchema,
	errors: z.string()
});

// GET BN_API/{domain}/validate

const GetCustomDomainValidateErrorSchema = CustomDomainResponseErrorSchema;

const CustomDomainValidationStatusSchema = z.enum(['valid']);

const GetCustomDomainValidateSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataWithCanisterIdSchema.extend({
		validation_status: CustomDomainValidationStatusSchema
	})
});

export const GetCustomDomainValidateSchema = GetCustomDomainValidateSuccessSchema.or(
	GetCustomDomainValidateErrorSchema
);

// GET BN_API/{domain}

const GetCustomDomainStateErrorSchema = CustomDomainResponseErrorSchema;

export const GetCustomDomainStateSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataWithNullableCanisterIdSchema.extend({
		registration_status: CustomDomainStateSchema
	})
});

export const GetCustomDomainStateSchema = GetCustomDomainStateSuccessSchema.or(
	GetCustomDomainStateErrorSchema
);

// POST BN_API/{domain}

const PostCustomDomainStateErrorSchema = CustomDomainResponseErrorSchema;

export const PostCustomDomainStateSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataWithCanisterIdSchema
});

export const PostCustomDomainStateSchema = PostCustomDomainStateSuccessSchema.or(
	PostCustomDomainStateErrorSchema
);

// DELETE BN_API/{domain}

const DeleteCustomDomainStateErrorSchema = CustomDomainResponseErrorSchema;

export const DeleteCustomDomainStateSuccessSchema = z.strictObject({
	status: CustomDomainResponseStatusSchema.extract(['success']),
	message: z.string(),
	data: CustomDomainResponseDataSchema
});

export const DeleteCustomDomainStateSchema = DeleteCustomDomainStateSuccessSchema.or(
	DeleteCustomDomainStateErrorSchema
);
