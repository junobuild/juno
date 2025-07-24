import type {
	AuthenticationConfig,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_INVALID_ORIGIN,
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
} from '@junobuild/errors';
import { inject } from 'vitest';
import { deleteDefaultIndexHTML } from '../../../utils/satellite-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Authentication', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;
	let canisterId: Principal;
	let canisterIdUrl: string;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		canisterIdUrl = `https://${canisterId.toText()}.icp0.io`;

		await deleteDefaultIndexHTML({ actor, controller });
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

		const invalidDomain = 'domain%20.com';

		it('should throw if derivation origin is malformed', async () => {
			const { set_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: [invalidDomain],
						external_alternative_origins: toNullable()
					}
				],
				rules: []
			};

			await expect(set_auth_config(config)).rejects.toThrow(
				`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
			);
		});

		it('should throw if external alternative origin is malformed', async () => {
			const { set_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: toNullable(),
						external_alternative_origins: [[invalidDomain]]
					}
				],
				rules: []
			};

			await expect(set_auth_config(config)).rejects.toThrow(
				`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
			);
		});

		it('should set config auth domain', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com'],
						external_alternative_origins: toNullable()
					}
				],
				rules: []
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
			const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

			expect(responseBody).toEqual(JSON.stringify({ alternativeOrigins: [canisterIdUrl] }));
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual([canisterIdUrl]);
		});

		const externalAlternativeOrigins = ['other.com', 'another.com'];
		const externalAlternativeOriginsUrls = externalAlternativeOrigins.map(
			(url) => `https://${url}`
		);

		it('should set external alternative origins', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com'],
						external_alternative_origins: [externalAlternativeOrigins]
					}
				],
				rules: []
			};

			await set_auth_config(config);

			const result = await get_auth_config();

			expect(result).toEqual([config]);
		});

		it('should expose /.well-known/ii-alternative-origins with external origins', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

			expect(responseBody).toEqual(
				JSON.stringify({ alternativeOrigins: [canisterIdUrl, ...externalAlternativeOriginsUrls] })
			);
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual([
				canisterIdUrl,
				...externalAlternativeOriginsUrls
			]);
		});

		it('should set config auth domain to none', async () => {
			const { set_auth_config, get_auth_config } = actor;

			const config: AuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: [],
						external_alternative_origins: toNullable()
					}
				],
				rules: []
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
				internet_identity: [],
				rules: []
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

		const urls = ['test.com', 'test2.com'];
		const httpsUrls = urls.map((url) => `https://${url}`);

		describe('With custom domains', () => {
			it('should expose canister id and filtered custom domains as alternative origin', async () => {
				const { set_auth_config, http_request, set_custom_domain } = actor;

				await set_custom_domain(urls[0], []);
				await set_custom_domain(urls[1], []);

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: ['domain.com'],
							external_alternative_origins: toNullable()
						}
					],
					rules: []
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
				const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

				const responseObj = JSON.parse(responseBody);

				expect({
					...responseObj,
					alternativeOrigins: responseObj.alternativeOrigins.sort()
				}).toStrictEqual({
					alternativeOrigins: [...httpsUrls, canisterIdUrl].sort()
				});
			});

			it('should not expose canister id if canister id is the derivation origin', async () => {
				const { set_auth_config, http_request } = actor;

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: []
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
				const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

				const responseObj = JSON.parse(responseBody);

				expect({
					...responseObj,
					alternativeOrigins: responseObj.alternativeOrigins.sort()
				}).toStrictEqual({
					alternativeOrigins: [...httpsUrls].sort()
				});
			});

			it('should not expose alternative origins if derivation is the canister ID and no custom domains', async () => {
				const { del_custom_domain, set_auth_config, http_request } = actor;

				await del_custom_domain(urls[0]);
				await del_custom_domain(urls[1]);

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: []
				};

				await set_auth_config(config);

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

		describe('With custom domains and external alternative origins', () => {
			it('should expose canister id, filtered custom domains and external as alternative origin', async () => {
				const { set_auth_config, http_request, set_custom_domain } = actor;

				await set_custom_domain(urls[0], []);
				await set_custom_domain(urls[1], []);

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: ['domain.com'],
							external_alternative_origins: [externalAlternativeOrigins]
						}
					],
					rules: []
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
				const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

				const responseObj = JSON.parse(responseBody);

				expect({
					...responseObj,
					alternativeOrigins: responseObj.alternativeOrigins.sort()
				}).toStrictEqual({
					alternativeOrigins: [
						...httpsUrls,
						...externalAlternativeOriginsUrls,
						canisterIdUrl
					].sort()
				});
			});

			it('should filter external equals custom domains', async () => {
				const { set_auth_config, http_request } = actor;

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: [[urls[0], externalAlternativeOrigins[0]]]
						}
					],
					rules: []
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
				const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

				const responseObj = JSON.parse(responseBody);

				expect({
					...responseObj,
					alternativeOrigins: responseObj.alternativeOrigins.sort()
				}).toStrictEqual({
					alternativeOrigins: [...httpsUrls, externalAlternativeOriginsUrls[0]].sort()
				});
			});

			it('should not expose canister id if canister id is the derivation origin', async () => {
				const { set_auth_config, http_request } = actor;

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: [externalAlternativeOrigins]
						}
					],
					rules: []
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
				const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

				const responseObj = JSON.parse(responseBody);

				expect({
					...responseObj,
					alternativeOrigins: responseObj.alternativeOrigins.sort()
				}).toStrictEqual({
					alternativeOrigins: [...httpsUrls, ...externalAlternativeOriginsUrls].sort()
				});
			});

			it('should not expose alternative origins if derivation is the canister ID and no custom domains and not external', async () => {
				const { del_custom_domain, set_auth_config, http_request } = actor;

				await del_custom_domain(urls[0]);
				await del_custom_domain(urls[1]);

				const config: AuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: []
				};

				await set_auth_config(config);

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
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on setting config', async () => {
			const { set_auth_config } = actor;

			await expect(
				set_auth_config({
					internet_identity: [
						{ derivation_origin: ['demo.com'], external_alternative_origins: toNullable() }
					],
					rules: []
				})
			).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting config', async () => {
			const { get_auth_config } = actor;

			await expect(get_auth_config()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});
});
