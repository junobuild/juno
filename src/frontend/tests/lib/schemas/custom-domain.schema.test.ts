import {
	DeleteCustomDomainStateSchema,
	GetCustomDomainStateSchema,
	GetCustomDomainValidateSchema,
	PostCustomDomainStateSchema
} from '$lib/schemas/custom-domain.schema';

describe('custom-domain.schemas', () => {
	describe('/validate', () => {
		it('validates GetCustomDomainValidateSchema success', () => {
			const parsed = GetCustomDomainValidateSchema.safeParse({
				status: 'success',
				message: 'ok',
				data: {
					domain: 'hello.com',
					canister_id: 'aaaaa-aa',
					validation_status: 'valid'
				}
			});

			expect(parsed.success).toBeTruthy();
		});

		it('validates GetCustomDomainValidateSchema error without canister ID', () => {
			const parsed = GetCustomDomainValidateSchema.safeParse({
				status: 'success',
				message: 'ok',
				data: {
					domain: 'hello.com',
					canister_id: null,
					validation_status: 'valid'
				}
			});

			expect(parsed.success).toBeFalsy();
		});

		it('validates GetCustomDomainValidateSchema error', () => {
			const parsed = GetCustomDomainValidateSchema.safeParse({
				status: 'error',
				message: 'Something went wrong',
				data: { domain: 'hello.com' },
				errors: 'boom'
			});

			expect(parsed.success).toBeTruthy();
		});
	});

	describe('GET', () => {
		it('validates GetCustomDomainStateSchema success with nullable canister', () => {
			const parsed = GetCustomDomainStateSchema.safeParse({
				status: 'success',
				message: 'ok',
				data: {
					domain: 'test.com',
					canister_id: null,
					registration_status: 'registered'
				}
			});

			expect(parsed.success).toBeTruthy();
		});

		it('validates GetCustomDomainStateSchema error', () => {
			const parsed = GetCustomDomainStateSchema.safeParse({
				status: 'error',
				message: 'failure',
				data: { domain: 'foo.com' },
				errors: 'bad'
			});

			expect(parsed.success).toBeTruthy();
		});
	});

	describe('POST', () => {
		it('validates PostCustomDomainStateSchema success', () => {
			const parsed = PostCustomDomainStateSchema.safeParse({
				status: 'success',
				message: 'ok',
				data: {
					domain: 'hello.com',
					canister_id: 'aaaaa-aa'
				}
			});

			expect(parsed.success).toBeTruthy();
		});

		it('validates PostCustomDomainStateSchema error without canister id', () => {
			const parsed = PostCustomDomainStateSchema.safeParse({
				status: 'success',
				message: 'ok',
				data: {
					domain: 'hello.com',
					canister_id: undefined
				}
			});

			expect(parsed.success).toBeFalsy();
		});

		it('validates PostCustomDomainStateSchema error', () => {
			const parsed = PostCustomDomainStateSchema.safeParse({
				status: 'error',
				message: 'critical',
				data: { domain: 'bad.com' },
				errors: 'fail'
			});

			expect(parsed.success).toBeTruthy();
		});
	});

	describe('DELETE', () => {
		it('validates DeleteCustomDomainStateSchema success', () => {
			const parsed = DeleteCustomDomainStateSchema.safeParse({
				status: 'success',
				message: 'removed',
				data: { domain: 'bye.com' }
			});

			expect(parsed.success).toBeTruthy();
		});

		it('validates DeleteCustomDomainStateSchema error', () => {
			const parsed = DeleteCustomDomainStateSchema.safeParse({
				status: 'error',
				message: 'nope',
				data: { domain: 'bye.com' },
				errors: 'cannot delete'
			});

			expect(parsed.success).toBeTruthy();
		});
	});
});
