import type { SatelliteActor, SatelliteDid } from '$declarations';
import type {
	OpenIdAutomationProvider,
	OpenIdAutomationProviderConfig
} from '$declarations/satellite/satellite.did';
import type { Actor } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import { mockRepositoryKey } from '../mocks/automation.mocks';

/* eslint-disable vitest/require-top-level-describe */

export const testAutomationConfig = ({ actor }: { actor: () => Actor<SatelliteActor> }) => {
	const assertConfig = async ({
		config,
		version
	}: {
		config: SatelliteDid.SetAutomationConfig;
		version: bigint;
	}) => {
		const { get_automation_config } = actor();

		const result = fromNullable(await get_automation_config());

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
		const { get_automation_config } = actor();

		const config = await get_automation_config();

		expect(config).toEqual([]);
	});

	it('should set config automation domain', async () => {
		const { set_automation_config } = actor();

		const config: SatelliteDid.SetAutomationConfig = {
			openid: [],
			version: []
		};

		await set_automation_config(config);

		await assertConfig({ config, version: 1n });
	});
};

export const testAutomationOpenIdConfig = ({
	actor,
	version
}: {
	actor: () => Actor<SatelliteActor>;
	version: bigint;
}) => {
	const githubConfig: [OpenIdAutomationProvider, OpenIdAutomationProviderConfig] = [
		{ GitHub: null },
		{
			repositories: [[mockRepositoryKey, { branches: [] }]],
			controller: []
		}
	];

	it('should set github repo', async () => {
		const { set_automation_config, get_automation_config } = actor();

		const config: SatelliteDid.SetAutomationConfig = {
			openid: [
				{
					providers: [githubConfig],
					observatory_id: []
				}
			],
			version: [version]
		};

		await set_automation_config(config);

		const updatedConfig = await get_automation_config();

		const github = fromNullable(fromNullable(updatedConfig)?.openid ?? [])?.providers.find(
			([key]) => 'GitHub' in key
		)?.[1];

		expect(github?.repositories[0]).toEqual([mockRepositoryKey, { branches: [] }]);
	});

	it('should disable github', async () => {
		const { set_automation_config, get_automation_config } = actor();

		const config: SatelliteDid.SetAutomationConfig = {
			openid: [],
			version: [version + 1n]
		};

		await set_automation_config(config);

		const updatedConfig = await get_automation_config();

		const github = fromNullable(fromNullable(updatedConfig)?.openid ?? [])?.providers.find(
			([key]) => 'GitHub' in key
		);

		expect(github).toBeUndefined();
	});
};
