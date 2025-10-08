import type { SatelliteActor } from '$lib/api/actors/actor.factory';
import type { SatelliteDid } from '$lib/types/declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_INVALID_ORIGIN,
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
} from '@junobuild/errors';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe('Satellite > Authentication', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;
	let canisterIdUrl: string;

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock();

		pic = p;
		canisterId = c;
		actor = a;
		controller = cO;
		canisterIdUrl = url;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		const assertConfig = async ({
			config,
			version
		}: {
			config: SatelliteDid.SetAuthenticationConfig;
			version: bigint;
		}) => {
			const { get_auth_config } = actor;

			const result = fromNullable(await get_auth_config());

			expect(result).toEqual(
				expect.objectContaining({
					...config,
					created_at: [expect.any(BigInt)],
					updated_at: [expect.any(BigInt)],
					version: [version]
				})
			);

			expect(fromNullable(result?.created_at ?? []) ?? 0n).toBeGreaterThan(0n);
			expect(fromNullable(result?.updated_at ?? []) ?? 0n).toBeGreaterThan(0n);
		};

		it('should have empty config per default', async () => {
			const { get_auth_config } = actor;

			const config = await get_auth_config();

			expect(config).toEqual([]);
		});

		const invalidDomain = 'domain%20.com';

		it('should throw if derivation origin is malformed', async () => {
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: [invalidDomain],
						external_alternative_origins: toNullable()
					}
				],
				rules: [],
				version: []
			};

			await expect(set_auth_config(config)).rejects.toThrow(
				`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
			);
		});

		it('should throw if external alternative origin is malformed', async () => {
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: toNullable(),
						external_alternative_origins: [[invalidDomain]]
					}
				],
				rules: [],
				version: []
			};

			await expect(set_auth_config(config)).rejects.toThrow(
				`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
			);
		});

		it('should set config auth domain', async () => {
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com'],
						external_alternative_origins: toNullable()
					}
				],
				rules: [],
				version: []
			};

			await set_auth_config(config);

			await assertConfig({ config, version: 1n });
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
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com'],
						external_alternative_origins: [externalAlternativeOrigins]
					}
				],
				rules: [],
				version: [1n]
			};

			await set_auth_config(config);

			await assertConfig({ config, version: 2n });
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
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: [],
						external_alternative_origins: toNullable()
					}
				],
				rules: [],
				version: [2n]
			};

			await set_auth_config(config);

			await assertConfig({ config, version: 3n });
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
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				version: [3n]
			};

			await set_auth_config(config);

			await assertConfig({ config, version: 4n });
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: ['domain.com'],
							external_alternative_origins: toNullable()
						}
					],
					rules: [],
					version: [4n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: [],
					version: [5n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: [],
					version: [6n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: ['domain.com'],
							external_alternative_origins: [externalAlternativeOrigins]
						}
					],
					rules: [],
					version: [7n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: [[urls[0], externalAlternativeOrigins[0]]]
						}
					],
					rules: [],
					version: [8n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: [externalAlternativeOrigins]
						}
					],
					rules: [],
					version: [9n]
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

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: toNullable()
						}
					],
					rules: [],
					version: [10n]
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

		it('should return config on set', async () => {
			const { set_auth_config } = actor;

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [
					{
						derivation_origin: ['domain.com'],
						external_alternative_origins: toNullable()
					}
				],
				rules: [],
				version: [11n]
			};

			const updatedConfig = await set_auth_config(config);

			expect(updatedConfig).toEqual(
				expect.objectContaining({
					...config,
					created_at: [expect.any(BigInt)],
					updated_at: [expect.any(BigInt)],
					version: [12n]
				})
			);

			expect(fromNullable(updatedConfig?.updated_at ?? []) ?? 0n).toBeGreaterThan(
				fromNullable(updatedConfig?.created_at ?? []) ?? 0n
			);
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
					rules: [],
					version: [10n]
				})
			).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting config', async () => {
			const { get_auth_config } = actor;

			await expect(get_auth_config()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});
});
