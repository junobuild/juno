import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { expect } from 'vitest';

export const testNotAllowedCdnMethods = ({
	actor,
	errorMsg
}: {
	actor: () => Actor<MissionControlActor | ConsoleActor>;
	errorMsg: string;
}) => {
	// eslint-disable-next-line vitest/require-top-level-describe
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
};
