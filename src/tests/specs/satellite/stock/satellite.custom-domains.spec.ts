import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	adminCustomDomainsTests,
	anonymousCustomDomainsTests
} from '../../../utils/custom-domains-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Custom domains', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
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
			).rejects.toThrow('/.well-known/ic-domains is a reserved asset.');
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
