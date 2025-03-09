import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { idlFactory as idlTestFactorySatellite } from '$test-declarations/test_satellite/test_satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
import { tick } from './pic-tests.utils';
import { controllersInitArgs, TEST_SATELLITE_WASM_PATH } from './setup-tests.utils';

export const setupTestSatellite = async (
	{ withUpgrade }: { withUpgrade: boolean } = { withUpgrade: true }
): Promise<{
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

	if (withUpgrade) {
		await upgradeTestSatellite({
			pic,
			controller,
			canisterId
		});
	}

	return {
		pic,
		actor,
		controller,
		canisterId
	};
};

export const upgradeTestSatellite = async ({
	pic,
	canisterId,
	controller
}: {
	pic: PocketIc;
	controller: Identity;
	canisterId: Principal;
}) => {
	// The random number generator is only initialized on upgrade because dev that do not use serverless functions do not need it
	await pic.upgradeCanister({
		canisterId,
		wasm: TEST_SATELLITE_WASM_PATH,
		sender: controller.getPrincipal()
	});

	// Wait for post_upgrade to kicks in since we defer instantiation of random
	await tick(pic);
};
