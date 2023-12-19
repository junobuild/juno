import type { MemorySize } from '$declarations/satellite/satellite.did';
import { getSatelliteActor } from '$lib/utils/actor.worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const memorySize = async ({
	satelliteId,
	identity
}: {
	satelliteId: string;
	identity: Identity;
}): Promise<MemorySize> => {
	const { memory_size } = await getSatelliteActor({
		satelliteId: Principal.fromText(satelliteId),
		identity
	});
	return memory_size();
};
