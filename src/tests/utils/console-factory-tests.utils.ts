import type { ConsoleActor } from '$declarations';
import type { Actor } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export const createSatelliteWithConsole = async ({
	user,
	actor
}: {
	user: Identity;
	actor: Actor<ConsoleActor>;
}): Promise<Principal> => {
	actor.setIdentity(user);

	const { create_satellite } = actor;

	return await create_satellite({
		user: user.getPrincipal(),
		block_index: toNullable(),
		name: toNullable(),
		storage: toNullable(),
		subnet_id: toNullable()
	});
};

export const createOrbiterWithConsole = async ({
	user,
	actor
}: {
	user: Identity;
	actor: Actor<ConsoleActor>;
}): Promise<Principal> => {
	actor.setIdentity(user);

	const { create_orbiter } = actor;

	return await create_orbiter({
		user: user.getPrincipal(),
		block_index: toNullable(),
		name: toNullable(),
		subnet_id: toNullable()
	});
};
