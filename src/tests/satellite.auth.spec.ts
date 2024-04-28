import type {
	AuthenticationConfig,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { ADMIN_ERROR_MSG } from './constants/satellite-tests.constants';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe('Satellite authentication', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;
	let canisterId: Principal;
	let canisterIdUrl: string;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg: satelliteInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		canisterIdUrl = `https://${canisterId.toText()}.icp0.io`;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should have empty config per default', async () => {
			const { get_auth_config } = actor;

			const config = await get_auth_config();
			expect(config).toEqual([]);
		});

		it('should set config auth domain', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com']
					}
				]
			};

			await set_auth_config(config);

			const result = await get_auth_config();
			expect(result).toEqual([config]);
		});

		it('should expose /.well-known/ii-alternative-origins', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(body as ArrayBuffer);
			expect(responseBody).toEqual(JSON.stringify({ alternativeOrigins: [canisterIdUrl] }));
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual([canisterIdUrl]);
		});

		it('should set config auth domain to none', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: []
					}
				]
			};

			await set_auth_config(config);

			const result = await get_auth_config();
			expect(result).toEqual([config]);
		});

		it('should not expose /.well-known/ii-alternative-origins', async () => {
			const { http_request } = actor;

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			expect(status_code).toBe(404);
		});

		it('should set config for ii to none', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: []
			};

			await set_auth_config(config);

			const result = await get_auth_config();
			expect(result).toEqual([config]);
		});

		it('should not expose /.well-known/ii-alternative-origins if the all config as been deleted as well', async () => {
			const { http_request } = actor;

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			expect(status_code).toBe(404);
		});

		it('should exporse canister id and filtered custom domains as alternative origin', async () => {
			const { set_auth_config, http_request, set_custom_domain, get_auth_config } = actor;

			const urls = ['test.com', 'test2.com'];

			await set_custom_domain(urls[0], []);
			await set_custom_domain(urls[1], []);

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com']
					}
				]
			};

			await set_auth_config(config);

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(body as ArrayBuffer);

			const httpsUrls = urls.map((url) => `https://${url}`);

			expect(responseBody).toEqual(
				JSON.stringify({ alternativeOrigins: [...httpsUrls, canisterIdUrl] })
			);
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual([...httpsUrls, canisterIdUrl]);
		});
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should create a user', async () => {
			const { set_doc, list_docs } = actor;

			await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				updated_at: toNullable()
			});

			const { items: users } = await list_docs('#user', {
				matcher: toNullable(),
				order: toNullable(),
				owner: toNullable(),
				paginate: toNullable()
			});

			expect(users).toHaveLength(1);
			expect(users.find(([key]) => key === user.getPrincipal().toText())).not.toBeUndefined();
		});
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on setting config', async () => {
			const { set_auth_config } = actor;

			await expect(
				set_auth_config({
					internet_identity: [{ derivation_origin: ['demo.com'] }]
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting config', async () => {
			const { get_auth_config } = actor;

			await expect(get_auth_config()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should not create a user', async () => {
			const { set_doc } = actor;

			const user = Ed25519KeyIdentity.generate();

			await expect(
				set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					updated_at: toNullable()
				})
			).rejects.toThrow('Cannot write.');
		});
	});
});
