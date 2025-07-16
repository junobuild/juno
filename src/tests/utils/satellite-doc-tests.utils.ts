import type { Doc, _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor } from '@dfinity/pic';
import type { ActorInterface } from '@dfinity/pic/dist/pocket-ic-actor';
import { toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
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

export const createUser = async <T extends ActorInterface<T>>({
	actor,
	user
}: {
	actor: Actor<T>;
	user?: Identity;
}): Promise<{
	user: Identity;
	doc: Doc;
}> => {
	const identity = user ?? Ed25519KeyIdentity.generate();

	actor.setIdentity(identity);

	// Cast for simplicity reason and to avoid verbosity in test suite.
	const { set_doc } = actor as unknown as SatelliteActor;

	const doc = await set_doc('#user', identity.getPrincipal().toText(), {
		data: await toArray({
			provider: 'internet_identity'
		}),
		description: toNullable(),
		version: toNullable()
	});

	return { user: identity, doc };
};
