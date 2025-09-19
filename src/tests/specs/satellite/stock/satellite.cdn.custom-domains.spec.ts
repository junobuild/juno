import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { AnonymousIdentity } from '@dfinity/agent';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_STORAGE_ERROR_RESERVED_ASSET
} from '@junobuild/errors';
import { MEMORIES } from '../../../constants/satellite-tests.constants';
import {
	adminCustomDomainsTests,
	adminCustomDomainsWithProposalTests,
	anonymousCustomDomainsTests
} from '../../../utils/custom-domains-tests.utils';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe.each(MEMORIES)('Satellite > Custom domains > $title', ({ memory }) => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			actor: a,
			pic: p,
			controller: cO
		} = await setupSatelliteStock({
			withIndexHtml: true,
			memory
		});

		pic = p;
		actor = a;
		controller = cO;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		anonymousCustomDomainsTests({
			actor: () => actor,
			errorMsg: JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		adminCustomDomainsTests({ actor: () => actor });

		adminCustomDomainsWithProposalTests({ actor: () => actor });

		it('should create asset ic-domains', async () => {
			const { get_asset } = actor;

			// We assumed previous test has run
			const asset = await get_asset('#dapp', '/.well-known/ic-domains');

			expect(asset[0]?.key.full_path).toEqual('/.well-known/ic-domains');
		});

		it('should not delete asset ic-domains when deleting all assets', async () => {
			const { get_asset, del_assets } = actor;

			await del_assets('#dapp');

			const asset = await get_asset('#dapp', '/.well-known/ic-domains');

			expect(asset[0]?.key.full_path).toEqual('/.well-known/ic-domains');
		});

		it('should throw error if try to upload ic-domains', async () => {
			const { init_asset_upload } = actor;

			await expect(
				init_asset_upload({
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/.well-known/ic-domains',
					name: 'ic-domains',
					token: toNullable()
				})
			).rejects.toThrow(`${JUNO_STORAGE_ERROR_RESERVED_ASSET} (/.well-known/ic-domains)`);
		});

		it('should not expose /.well-known/ic-domains after all domains are deleted', async () => {
			const { http_request, del_custom_domain } = actor;

			await del_custom_domain('test2.com');
			await del_custom_domain('test3.com');

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			});

			expect(status_code).toBe(404);
		});
	});
});
