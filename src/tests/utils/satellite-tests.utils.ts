import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Actor } from '@dfinity/pic';

export const deleteDefaultIndexHTML = async ({
	actor,
	controller
}: {
	actor: Actor<SatelliteActor>;
	controller: Identity;
}) => {
	actor.setIdentity(controller);

	const { del_assets } = actor;
	await del_assets('#dapp');
};
