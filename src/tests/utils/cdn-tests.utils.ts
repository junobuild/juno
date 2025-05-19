import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { expect } from 'vitest';
import type {StorageConfig} from "$declarations/satellite/satellite.did";

/* eslint-disable vitest/require-top-level-describe */

export const testNotAllowedCdnMethods = ({
	actor,
	errorMsg
}: {
	actor: () => Actor<MissionControlActor | ConsoleActor>;
	errorMsg: string;
}) => {
	it('should throw errors on setting config', async () => {
		const { set_storage_config } = actor();

		await expect(
			set_storage_config({
				headers: [],
				iframe: toNullable(),
				redirects: toNullable(),
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable()
			})
		).rejects.toThrow(errorMsg);
	});

	it('should throw errors on getting storage config', async () => {
		const { get_storage_config } = actor();

		await expect(get_storage_config()).rejects.toThrow(errorMsg);
	});

	it('should throw errors on setting custom domain', async () => {
		const { set_custom_domain } = actor();

		await expect(set_custom_domain('hello.com', ['123456'])).rejects.toThrow(errorMsg);
	});

	it('should throw errors on listing custom domains', async () => {
		const { list_custom_domains } = actor();

		await expect(list_custom_domains()).rejects.toThrow(errorMsg);
	});
};

export const testControlledCdnMethods = ({
											 actor,
										 }: {
	actor: () => Actor<MissionControlActor | ConsoleActor>;
}) => {
	it('should set and get config', async () => {
		const { set_storage_config, get_storage_config } = actor();

		const config: StorageConfig = {
			headers: [['*', [['Cache-Control', 'no-cache']]]],
			iframe: toNullable({ Deny: null }),
			redirects: [],
			rewrites: [],
			raw_access: toNullable(),
			max_memory_size: toNullable()
		};

		await set_storage_config(config);

		const savedConfig = await get_storage_config();

		expect(savedConfig).toEqual(config);
	});
}
/* eslint-enable */
