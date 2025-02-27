import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { idlFactory as idlTestFactorySatellite } from '$test-declarations/test_satellite/test_satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
import { tick } from './pic-tests.utils';
import { controllersInitArgs, TEST_SATELLITE_WASM_PATH } from './setup-tests.utils';
import type {Principal} from "@dfinity/principal";

export const setupTestSatellite = async (): Promise<{
	pic: PocketIc;
	actor: Actor<TestSatelliteActor>;
	controller: Identity;
	canisterId: Principal;
}> => {
	const controller = Ed25519KeyIdentity.generate();

	const pic = await PocketIc.create(inject('PIC_URL'));

	const { actor: c, canisterId } = await pic.setupCanister<TestSatelliteActor>({
		idlFactory: idlTestFactorySatellite,
		wasm: TEST_SATELLITE_WASM_PATH,
		arg: controllersInitArgs(controller),
		sender: controller.getPrincipal()
	});

	const actor = c;
	actor.setIdentity(controller);

	await tick(pic);

	// The random number generator is only initialized on upgrade because dev that do not use serverless functions do not need it
	await pic.upgradeCanister({
		canisterId,
		wasm: TEST_SATELLITE_WASM_PATH,
		sender: controller.getPrincipal()
	});

	// Wait for post_upgrade to kicks in since we defer instantiation of random
	await tick(pic);

	return {
		pic,
		actor,
		controller,
		canisterId
	};
};
