import {
	type OrbiterActor,
	type SatelliteActor,
	idlFactoryOrbiter,
	idlFactorySatellite
} from '$lib/api/actors/actor.factory';
import type { Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import type { PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { controllersInitArgs, ORBITER_WASM_PATH, SATELLITE_WASM_PATH } from './setup-tests.utils';

export const missionControlUserInitArgs = (owner: Principal): ArrayBuffer =>
	IDL.encode(
		[
			IDL.Record({
				user: IDL.Principal
			})
		],
		[{ user: owner }]
	).buffer as ArrayBuffer;

export const setupMissionControlModules = async ({
	pic,
	controller,
	missionControlId
}: {
	pic: PocketIc;
	controller: Identity;
	missionControlId: Principal;
}): Promise<{ satelliteId: Principal; orbiterId: Principal }> => {
	const { canisterId: orbiterId } = await pic.setupCanister<OrbiterActor>({
		idlFactory: idlFactoryOrbiter,
		wasm: ORBITER_WASM_PATH,
		arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
		sender: controller.getPrincipal()
	});

	await pic.updateCanisterSettings({
		canisterId: orbiterId,
		controllers: [controller.getPrincipal(), missionControlId],
		sender: controller.getPrincipal()
	});

	const { canisterId: satelliteId } = await pic.setupCanister<SatelliteActor>({
		idlFactory: idlFactorySatellite,
		wasm: SATELLITE_WASM_PATH,
		arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
		sender: controller.getPrincipal()
	});

	await pic.updateCanisterSettings({
		canisterId: satelliteId,
		controllers: [controller.getPrincipal(), missionControlId],
		sender: controller.getPrincipal()
	});

	return { satelliteId, orbiterId };
};
