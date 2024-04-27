import type {
	AuthenticationConfig,
	Config,
	_SERVICE as SatelliteActor,
	StorageConfig
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect } from 'vitest';
import { ADMIN_ERROR_MSG } from './constants/satellite-tests.constants';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe('Satellite authentication', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const storage: StorageConfig = {
		headers: [],
		redirects: [],
		iframe: [],
		rewrites: []
	};

	beforeAll(async () => {
		pic = await PocketIc.create();

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

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should have empty config per default', async () => {
			const { get_config } = actor;

			const config = await get_config();
			expect(config.authentication).toEqual([]);
		});

		it('should set config auth domain', async () => {
			const { set_config, get_config } = actor;

			const authentication: AuthenticationConfig = {
				internet_identity: [
					{
						authentication_domain: ['domain.com']
					}
				]
			};

			const config: Config = {
				storage,
				authentication: [authentication]
			};

			await set_config(config);

			const result = await get_config();
			expect(result).toEqual(config);
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
			expect(responseBody).toEqual(JSON.stringify({ alternativeOrigins: ['domain.com'] }));
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual(['domain.com']);
		});

		it('should set config auth domain to none', async () => {
			const { set_config, get_config } = actor;

			const authentication: AuthenticationConfig = {
				internet_identity: [
					{
						authentication_domain: []
					}
				]
			};

			const config: Config = {
				storage,
				authentication: [authentication]
			};

			await set_config(config);

			const result = await get_config();
			expect(result).toEqual(config);
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
			const { set_config, get_config } = actor;

			// First reset a valid config
			await set_config({
				storage,
				authentication: [
					{
						internet_identity: [
							{
								authentication_domain: ['domain.com']
							}
						]
					}
				]
			});

			const authentication: AuthenticationConfig = {
				internet_identity: []
			};

			const config: Config = {
				storage,
				authentication: [authentication]
			};

			await set_config(config);

			const result = await get_config();
			expect(result).toEqual(config);
		});

		it('should not expose /.well-known/ii-alternative-origins if the all II config as been deleted as well', async () => {
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

		it('should set config for authentication to none', async () => {
			const { set_config, get_config } = actor;

			// First reset a valid config
			await set_config({
				storage,
				authentication: [
					{
						internet_identity: [
							{
								authentication_domain: ['domain.com']
							}
						]
					}
				]
			});

			const config: Config = {
				storage,
				authentication: []
			};

			await set_config(config);

			const result = await get_config();
			expect(result).toEqual(config);
		});

		it('should not expose /.well-known/ii-alternative-origins if the all authentication config as been deleted as well', async () => {
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
			const { set_config } = actor;

			const config: Config = {
				storage,
				authentication: [
					{
						internet_identity: [{ authentication_domain: ['demo.com'] }]
					}
				]
			};

			await expect(set_config(config)).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting config', async () => {
			const { get_config } = actor;

			await expect(get_config()).rejects.toThrow(ADMIN_ERROR_MSG);
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
