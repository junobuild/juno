import type { ConsoleActor, SatelliteActor } from '$declarations';
import type { Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { JUNO_STORAGE_ERROR_RESERVED_ASSET } from '@junobuild/errors';
import { uploadFile } from './cdn-tests.utils';

export const anonymousCustomDomainsTests = ({
	actor,
	errorMsg
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	errorMsg: string;
}) => {
	// eslint-disable-next-line vitest/require-top-level-describe
	it('should throw errors on setting custom domain', async () => {
		const { set_custom_domain } = actor();

		await expect(set_custom_domain('hello.com', toNullable())).rejects.toThrow(errorMsg);
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('should throw errors on listing custom domains', async () => {
		const { list_custom_domains } = actor();

		await expect(list_custom_domains()).rejects.toThrow(errorMsg);
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('should throw errors on deleting custom domains', async () => {
		const { del_custom_domain } = actor();

		await expect(del_custom_domain('hello.com')).rejects.toThrow(errorMsg);
	});
};

export const adminCustomDomainsTests = ({
	actor
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
}) => {
	// eslint-disable-next-line vitest/require-top-level-describe
	it('should set custom domain', async () => {
		const { set_custom_domain, list_custom_domains } = actor();

		await set_custom_domain('hello.com', ['123456']);
		await set_custom_domain('test2.com', []);

		const results = await list_custom_domains();

		expect(results).toHaveLength(2);

		const hello = results.find(([key, _]) => key === 'hello.com');
		const test2 = results.find(([key, _]) => key === 'test2.com');

		assertNonNullish(hello);
		assertNonNullish(test2);

		expect(hello[0]).toEqual('hello.com');
		expect(hello[1].bn_id).toEqual(['123456']);
		expect(hello[1].updated_at).not.toBeUndefined();
		expect(hello[1].updated_at).toBeGreaterThan(0n);
		expect(hello[1].created_at).not.toBeUndefined();
		expect(hello[1].created_at).toBeGreaterThan(0n);
		expect(fromNullable(hello[1].version) ?? 0n).toBeGreaterThan(0n);

		expect(test2[0]).toEqual('test2.com');
		expect(test2[1].bn_id).toEqual([]);
		expect(test2[1].updated_at).not.toBeUndefined();
		expect(test2[1].updated_at).toBeGreaterThan(0n);
		expect(test2[1].created_at).not.toBeUndefined();
		expect(test2[1].created_at).toBeGreaterThan(0n);
		expect(fromNullable(test2[1].version) ?? 0n).toBeGreaterThan(0n);
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('should expose /.well-known/ic-domains', async () => {
		const { http_request } = actor();

		const { body } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/.well-known/ic-domains'
		});

		const decoder = new TextDecoder();

		expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain('hello.com');
		expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain('test2.com');
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('could delete custom domain', async () => {
		const { set_custom_domain, http_request, list_custom_domains, del_custom_domain } = actor();

		await set_custom_domain('test3.com', ['123456']);

		const resultsBefore = await list_custom_domains();

		// Two previous domains + test3
		expect(resultsBefore).toHaveLength(3);

		await del_custom_domain('hello.com');

		const resultsAfter = await list_custom_domains();

		expect(resultsAfter).toHaveLength(2);

		const { body } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/.well-known/ic-domains'
		});

		const decoder = new TextDecoder();

		expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).not.toContain('hello.com');
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('should still expose /.well-known/ic-domains if domains still exist after delete', async () => {
		const { http_request } = actor();

		const { body } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/.well-known/ic-domains'
		});

		const decoder = new TextDecoder();

		expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain('test3.com');
		expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain('test2.com');
	});
};

export const adminCustomDomainsWithProposalTests = ({
	actor
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
}) => {
	// eslint-disable-next-line vitest/require-top-level-describe
	it('should not delete asset ic-domains when deleting all assets', async () => {
		const { http_request, init_proposal, submit_proposal, commit_proposal } = actor();

		const [proposalId, _] = await init_proposal({
			AssetsUpgrade: {
				clear_existing_assets: toNullable(true)
			}
		});

		await uploadFile({ proposalId, actor: actor() });

		const [__, proposal] = await submit_proposal(proposalId);

		const sha = fromNullable(proposal.sha256);
		assertNonNullish(sha);

		await commit_proposal({
			sha256: sha,
			proposal_id: proposalId
		});

		const { status_code } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/.well-known/ic-domains'
		});

		expect(status_code).toEqual(200);
	});

	// eslint-disable-next-line vitest/require-top-level-describe
	it('should throw error if try to upload ic-domains', async () => {
		const { init_proposal_many_assets_upload, init_proposal } = actor();

		const [proposalId, _] = await init_proposal({
			AssetsUpgrade: {
				clear_existing_assets: toNullable()
			}
		});

		await expect(
			init_proposal_many_assets_upload(
				[
					{
						collection: '#dapp',
						description: toNullable(),
						encoding_type: [],
						full_path: '/.well-known/ic-domains',
						name: 'ic-domains',
						token: toNullable()
					}
				],
				proposalId
			)
		).rejects.toThrow(`${JUNO_STORAGE_ERROR_RESERVED_ASSET} (/.well-known/ic-domains)`);
	});
};
