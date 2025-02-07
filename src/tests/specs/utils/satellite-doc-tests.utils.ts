import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { mockData } from '../mocks/doc.mocks';

export const createDoc = async ({
	actor,
	collection
}: {
	actor: Actor<SatelliteActor>;
	collection: string;
}): Promise<string> => {
	const key = nanoid();

	const { set_doc } = actor;

	await set_doc(collection, key, {
		data: mockData,
		description: toNullable(),
		version: toNullable()
	});

	return key;
};
