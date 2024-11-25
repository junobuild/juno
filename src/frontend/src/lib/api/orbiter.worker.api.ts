import type { MemorySize } from '$declarations/orbiter/orbiter.did';
import { getOrbiterActor } from '$lib/api/actors/actor.juno.api';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const memorySize = async ({
	orbiterId,
	identity
}: {
	orbiterId: string;
	identity: Identity;
}): Promise<MemorySize> => {
	const { memory_size } = await getOrbiterActor({
		orbiterId: Principal.fromText(orbiterId),
		identity
	});
	return memory_size();
};
