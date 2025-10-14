import type { ConsoleActor, SatelliteActor, SatelliteDid } from '$declarations';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';
import { JUNO_AUTH_ERROR_INVALID_ORIGIN } from '@junobuild/errors';
import {
	EXTERNAL_ALTERNATIVE_ORIGINS,
	EXTERNAL_ALTERNATIVE_ORIGINS_URLS
} from '../constants/auth-tests.constants';
import { fetchLogs } from './mgmt-tests.utils';

/* eslint-disable vitest/require-top-level-describe */

export const testAuthConfig = ({
	actor,
	withWellKnownIIAlternativeOrigins
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	withWellKnownIIAlternativeOrigins?: () => string;
}) => {
	const canisterIdUrl = withWellKnownIIAlternativeOrigins?.();

	const assertConfig = async ({
		config,
		version
	}: {
		config: SatelliteDid.SetAuthenticationConfig;
		version: bigint;
	}) => {
		const { get_auth_config } = actor();

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
		const { get_auth_config } = actor();

		const config = await get_auth_config();

		expect(config).toEqual([]);
	});

	const invalidDomain = 'domain%20.com';

	it('should throw if derivation origin is malformed', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: [invalidDomain],
					external_alternative_origins: toNullable()
				}
			],
			rules: [],
			google: [],
			version: []
		};

		await expect(set_auth_config(config)).rejects.toThrow(
			`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
		);
	});

	it('should throw if external alternative origin is malformed', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: toNullable(),
					external_alternative_origins: [[invalidDomain]]
				}
			],
			rules: [],
			google: [],
			version: []
		};

		await expect(set_auth_config(config)).rejects.toThrow(
			`${JUNO_AUTH_ERROR_INVALID_ORIGIN} (${invalidDomain})`
		);
	});

	it('should set config auth domain', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: ['domain.com'],
					external_alternative_origins: toNullable()
				}
			],
			rules: [],
			google: [],
			version: []
		};

		await set_auth_config(config);

		await assertConfig({ config, version: 1n });
	});

	if (nonNullish(canisterIdUrl)) {
		it('should expose /.well-known/ii-alternative-origins', async () => {
			const { http_request } = actor();

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
	}

	it('should set external alternative origins', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: ['domain.com'],
					external_alternative_origins: [EXTERNAL_ALTERNATIVE_ORIGINS]
				}
			],
			rules: [],
			google: [],
			version: [1n]
		};

		await set_auth_config(config);

		await assertConfig({ config, version: 2n });
	});

	if (nonNullish(canisterIdUrl)) {
		it('should expose /.well-known/ii-alternative-origins with external origins', async () => {
			const { http_request } = actor();

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
				JSON.stringify({
					alternativeOrigins: [canisterIdUrl, ...EXTERNAL_ALTERNATIVE_ORIGINS_URLS]
				})
			);
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual([
				canisterIdUrl,
				...EXTERNAL_ALTERNATIVE_ORIGINS_URLS
			]);
		});
	}

	it('should set config auth domain to none', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: [],
					external_alternative_origins: toNullable()
				}
			],
			rules: [],
			google: [],
			version: [2n]
		};

		await set_auth_config(config);

		await assertConfig({ config, version: 3n });
	});

	if (withWellKnownIIAlternativeOrigins) {
		it('should not expose /.well-known/ii-alternative-origins', async () => {
			const { http_request } = actor();

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			expect(status_code).toBe(404);
		});
	}

	it('should set config for ii to none', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			google: [],
			version: [3n]
		};

		await set_auth_config(config);

		await assertConfig({ config, version: 4n });
	});

	if (withWellKnownIIAlternativeOrigins) {
		it('should not expose /.well-known/ii-alternative-origins if the all config as been deleted as well', async () => {
			const { http_request } = actor();

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			});

			expect(status_code).toBe(404);
		});
	}
};

export const testReturnAuthConfig = ({
	actor,
	version
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	version: bigint;
}) => {
	it('should return config on set', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [
				{
					derivation_origin: ['domain.com'],
					external_alternative_origins: toNullable()
				}
			],
			rules: [],
			google: [],
			version: [version]
		};

		const updatedConfig = await set_auth_config(config);

		expect(updatedConfig).toEqual(
			expect.objectContaining({
				...config,
				created_at: [expect.any(BigInt)],
				updated_at: [expect.any(BigInt)],
				version: [version + 1n]
			})
		);

		expect(fromNullable(updatedConfig?.updated_at ?? []) ?? 0n).toBeGreaterThan(
			fromNullable(updatedConfig?.created_at ?? []) ?? 0n
		);
	});
};

export const testAuthGoogleConfig = ({
	actor,
	version,
	pic,
	canisterId,
	controller
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	pic: () => PocketIc;
	canisterId: () => Principal;
	controller: () => Identity;
	version: bigint;
}) => {
	const CLIENT_ID = '974645666757-ebfaaau4cesdddqahu83e1qqmmmmdrod.apps.googleusercontent.com';

	const assertLog = async (logMessage: string) => {
		const logs = await fetchLogs({
			pic: pic(),
			controller: controller(),
			canisterId: canisterId()
		});

		const log = logs.find(([_, { message }]) => message === logMessage);

		expect(log).not.toBeUndefined();
	};

	it('should set google client id', async () => {
		const { set_auth_config, get_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			google: [
				{
					client_id: CLIENT_ID
				}
			],
			version: [version]
		};

		await set_auth_config(config);

		const updatedConfig = await get_auth_config();

		expect(fromNullable(fromNullable(updatedConfig)?.google ?? [])?.client_id).toEqual(CLIENT_ID);

		await assertLog('Authentication salt initialized.');
	});

	it('should disable google', async () => {
		const { set_auth_config, get_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			google: [],
			version: [version + 1n]
		};

		await set_auth_config(config);

		const updatedConfig = await get_auth_config();

		expect(fromNullable(fromNullable(updatedConfig)?.google ?? [])).toBeUndefined();
	});

	it('should not reinitialize salt', async () => {
		const { set_auth_config } = actor();

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			google: [
				{
					client_id: CLIENT_ID
				}
			],
			version: [version + 2n]
		};

		await set_auth_config(config);

		await assertLog('Authentication salt exists. Skipping initialization.');
	});
};
