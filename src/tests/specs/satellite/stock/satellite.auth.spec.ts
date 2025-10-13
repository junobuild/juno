import type { SatelliteActor, SatelliteDid } from '$declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import {
	EXTERNAL_ALTERNATIVE_ORIGINS,
	EXTERNAL_ALTERNATIVE_ORIGINS_URLS
} from '../../../constants/auth-tests.constants';
import { testAuthConfig, testReturnAuthConfig } from '../../../utils/auth-assertions-tests.utils';
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

		testAuthConfig({
			actor: () => actor,
			withWellKnownIIAlternativeOrigins: () => canisterIdUrl
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
					google: [],
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
					google: [],
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
					google: [],
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
							external_alternative_origins: [EXTERNAL_ALTERNATIVE_ORIGINS]
						}
					],
					rules: [],
					google: [],
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
						...EXTERNAL_ALTERNATIVE_ORIGINS_URLS,
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
							external_alternative_origins: [[urls[0], EXTERNAL_ALTERNATIVE_ORIGINS[0]]]
						}
					],
					rules: [],
					google: [],
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
					alternativeOrigins: [...httpsUrls, EXTERNAL_ALTERNATIVE_ORIGINS_URLS[0]].sort()
				});
			});

			it('should not expose canister id if canister id is the derivation origin', async () => {
				const { set_auth_config, http_request } = actor;

				const config: SatelliteDid.SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: [`${canisterId.toText()}.icp0.io`],
							external_alternative_origins: [EXTERNAL_ALTERNATIVE_ORIGINS]
						}
					],
					rules: [],
					google: [],
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
					alternativeOrigins: [...httpsUrls, ...EXTERNAL_ALTERNATIVE_ORIGINS_URLS].sort()
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
					google: [],
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

		testReturnAuthConfig({
			actor: () => actor,
			version: 11n
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
					google: [],
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
