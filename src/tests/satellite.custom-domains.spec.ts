import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import {afterAll, beforeAll, describe, expect, inject} from 'vitest';
import { ADMIN_ERROR_MSG } from './constants/satellite-tests.constants';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe('Satellite custom domains', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg: satelliteInitArgs(controller),
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

		it('should throw errors on setting custom domain', async () => {
			const { set_custom_domain } = actor;

			await expect(set_custom_domain('hello.com', toNullable())).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on listing custom domains', async () => {
			const { list_custom_domains } = actor;

			await expect(list_custom_domains()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting custom domains', async () => {
			const { del_custom_domain } = actor;

			await expect(del_custom_domain('hello.com')).rejects.toThrow(ADMIN_ERROR_MSG);
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should set custom domain', async () => {
			const { set_custom_domain, list_custom_domains } = actor;

			await set_custom_domain('hello.com', ['123456']);
			await set_custom_domain('test2.com', []);

			const results = await list_custom_domains();

			expect(results).toHaveLength(2);

			expect(results[0][0]).toEqual('hello.com');
			expect(results[0][1].bn_id).toEqual(['123456']);
			expect(results[0][1].updated_at).not.toBeUndefined();
			expect(results[0][1].updated_at).toBeGreaterThan(0n);
			expect(results[0][1].created_at).not.toBeUndefined();
			expect(results[0][1].created_at).toBeGreaterThan(0n);

			expect(results[1][0]).toEqual('test2.com');
			expect(results[1][1].bn_id).toEqual([]);
			expect(results[1][1].updated_at).not.toBeUndefined();
			expect(results[1][1].updated_at).toBeGreaterThan(0n);
			expect(results[1][1].created_at).not.toBeUndefined();
			expect(results[1][1].created_at).toBeGreaterThan(0n);
		});

		it('should expose /.well-known/ic-domains', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			});

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toContain('hello.com');
			expect(decoder.decode(body as ArrayBuffer)).toContain('test2.com');
		});

		it('could delete custom domain', async () => {
			const { set_custom_domain, http_request, list_custom_domains, del_custom_domain } = actor;

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
			expect(decoder.decode(body as ArrayBuffer)).not.toContain('hello.com');
		});

		it('should still expose /.well-known/ic-domains if domains still exist after delete', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			});

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toContain('test3.com');
			expect(decoder.decode(body as ArrayBuffer)).toContain('test2.com');
		});

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
