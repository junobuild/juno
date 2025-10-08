import { type SputnikActor, idlFactorySputnik } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { idlFactory as idlTestFactorySatellite } from '$test-declarations/test_satellite/test_satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, type ActorInterface, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { inject } from 'vitest';
import { setupChunkedCanister, upgradeChunkedCanister } from './ic-management-tests.utils';
import { tick } from './pic-tests.utils';
import {
	controllersInitArgs,
	TEST_SATELLITE_WASM_PATH,
	TEST_SPUTNIK_WASM_PATH
} from './setup-tests.utils';

export interface SetupFixtureCanister<T extends ActorInterface<T>> {
	pic: PocketIc;
	actor: Actor<T>;
	controller: Identity;
	canisterId: Principal;
}

export const setupTestSatellite = async (
	{ withUpgrade }: { withUpgrade: boolean } = { withUpgrade: true }
): Promise<SetupFixtureCanister<TestSatelliteActor>> =>
	await setupFixtureCanister({
		withUpgrade,
		idlFactory: idlTestFactorySatellite,
		wasm: TEST_SATELLITE_WASM_PATH
	});

export const setupTestSputnik = async (
	{ withUpgrade, currentDate }: { withUpgrade: boolean; currentDate?: Date } = { withUpgrade: true }
): Promise<SetupFixtureCanister<SputnikActor>> =>
	await setupFixtureCanister({
		currentDate,
		withUpgrade,
		idlFactory: idlFactorySputnik,
		wasm: TEST_SPUTNIK_WASM_PATH
	});

const setupFixtureCanister = async <T extends ActorInterface<T>>({
	withUpgrade,
	idlFactory,
	wasm,
	currentDate
}: {
	withUpgrade: boolean;
	idlFactory: IDL.InterfaceFactory;
	wasm: string;
	currentDate?: Date;
}): Promise<SetupFixtureCanister<T>> => {
	const controller = Ed25519KeyIdentity.generate();

	const pic = await PocketIc.create(inject('PIC_URL'));

	if (nonNullish(currentDate)) {
		await pic.setTime(currentDate.getTime());
	}

	const { actor: c, canisterId } = await setupChunkedCanister<T>({
		pic,
		idlFactory,
		wasmPath: wasm,
		arg: controllersInitArgs(controller),
		sender: controller
	});

	const actor = c;
	actor.setIdentity(controller);

	await tick(pic);

	if (withUpgrade) {
		await upgradeFixtureCanister({
			pic,
			controller,
			canisterId,
			wasm
		});
	}

	return {
		pic,
		actor,
		controller,
		canisterId
	};
};

export const upgradeTestSatellite = async (
	params: Omit<SetupFixtureCanister<TestSatelliteActor>, 'actor'>
) => {
	await upgradeFixtureCanister({
		...params,
		wasm: TEST_SATELLITE_WASM_PATH
	});
};

export const upgradeTestSputnik = async (
	params: Omit<SetupFixtureCanister<SputnikActor>, 'actor'>
) => {
	await upgradeFixtureCanister({
		...params,
		wasm: TEST_SPUTNIK_WASM_PATH
	});
};

const upgradeFixtureCanister = async <T extends ActorInterface<T>>({
	pic,
	canisterId,
	controller,
	wasm
}: Omit<SetupFixtureCanister<T>, 'actor'> & { wasm: string }) => {
	// The random number generator is only initialized on upgrade because dev that do not use serverless functions do not need it
	await upgradeChunkedCanister({
		pic,
		canisterId,
		wasmPath: wasm,
		sender: controller
	});

	// Wait for post_upgrade to kicks in since we defer instantiation of random
	await tick(pic);
};
