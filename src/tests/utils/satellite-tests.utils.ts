import { type SatelliteActor, idlFactorySatellite } from '$declarations';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { inject } from 'vitest';
import { SATELLITE_WASM_PATH, satelliteInitArgs } from './setup-tests.utils';

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

export const setupSatelliteStock = async (
	{
		withIndexHtml,
		memory,
		controllers
	}: {
		withIndexHtml: boolean;
		memory: { Heap: null } | { Stable: null } | null;
		controllers?: Principal[];
	} = {
		withIndexHtml: false,
		memory: { Heap: null }
	}
): Promise<{
	pic: PocketIc;
	canisterId: Principal;
	actor: Actor<SatelliteActor>;
	currentDate: Date;
	controller: Ed25519KeyIdentity;
	canisterIdUrl: string;
}> => {
	const pic = await PocketIc.create(inject('PIC_URL'));

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);
	await pic.setTime(currentDate.getTime());

	const controller = Ed25519KeyIdentity.generate();

	const { actor, canisterId } = await pic.setupCanister<SatelliteActor>({
		idlFactory: idlFactorySatellite,
		wasm: SATELLITE_WASM_PATH,
		arg: satelliteInitArgs({
			controllers: nonNullish(controllers)
				? [...controllers, controller.getPrincipal()]
				: controller,
			memory
		}),
		sender: controller.getPrincipal()
	});

	if (!withIndexHtml) {
		await deleteDefaultIndexHTML({ actor, controller });
	}

	return {
		pic,
		canisterId,
		actor,
		currentDate,
		controller,
		canisterIdUrl: `https://${canisterId.toText()}.icp0.io`
	};
};
