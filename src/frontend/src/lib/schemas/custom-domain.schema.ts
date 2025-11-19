import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

// App and BN

export const CustomDomainStateSchema = z.enum(['registering', 'registered', 'expired', 'failed']);

// BN

const CustomDomainResponseStatusSchema = z.enum(['success', 'error']);

const CustomDomainResponseDataSchema = z.strictObject({
	domain: z.string()
});

const CustomDomainResponseDataWithNullableCanisterIdSchema = z.strictObject({
	...CustomDomainResponseDataSchema.shape,
	// Workaround: while we observed the canister_id is provided for GET /validate and POST being provided, we also noticed
	// that the first GET request after POST did **not** provide the information, which leads to a validation issue.
	// Since this field is not used within the codebase, for consistency — to avoid having different types —
	// and to prevent similar issues in case those APIs someday do not provide the information in the future,
	// we set the field as nullable.
	canister_id: PrincipalTextSchema.nullable()
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
	data: CustomDomainResponseDataWithNullableCanisterIdSchema.extend({
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
	data: CustomDomainResponseDataWithNullableCanisterIdSchema
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
