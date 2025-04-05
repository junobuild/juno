import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import { idlFactory as idlFactorSputnik } from '$declarations/sputnik/sputnik.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	controllersInitArgs,
	SPUTNIK_WASM_PATH,
	TEST_SPUTNIK_WASM_PATH
} from '../../utils/setup-tests.utils';
import { crateVersion } from '../../utils/version-test.utils';

describe('Sputnik', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Default', () => {
		beforeAll(async () => {
			const { actor: c } = await pic.setupCanister<SputnikActor>({
				idlFactory: idlFactorSputnik,
				wasm: SPUTNIK_WASM_PATH,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
		});

		it('should expose build version', async () => {
			const sputnikVersion = crateVersion('sputnik');

			expect(await actor.build_version()).toEqual(sputnikVersion);
		});

		it('should expose satellite version', async () => {
			const satelliteVersion = crateVersion('satellite');

			expect(await actor.version()).toEqual(satelliteVersion);
		});
	});

	describe('Custom', () => {
		beforeAll(async () => {
			const { actor: c } = await pic.setupCanister<SputnikActor>({
				idlFactory: idlFactorSputnik,
				wasm: TEST_SPUTNIK_WASM_PATH,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
		});

		it('should expose build version', async () => {
			const sputnikVersion = crateVersion('sputnik');

			expect(await actor.build_version()).toEqual(sputnikVersion);
		});

		it('should expose satellite version', async () => {
			const satelliteVersion = crateVersion('satellite');

			expect(await actor.version()).toEqual(satelliteVersion);
		});
	});
});
