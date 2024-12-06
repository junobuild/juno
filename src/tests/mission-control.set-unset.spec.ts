import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactorMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		actor.setIdentity(controller);

		const { orbiterId: oId, satelliteId: sId } = await setupMissionControlModules({
			pic,
			controller,
			missionControlId
		});

		orbiterId = oId;
		satelliteId = sId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testIdentity = () => {
		it('should throw errors on set orbiter', async () => {
			const { set_orbiter } = actor;

			await expect(set_orbiter(orbiterId, [])).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on unset orbiter', async () => {
			const { unset_orbiter } = actor;

			await expect(unset_orbiter(orbiterId)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on set satellite', async () => {
			const { set_satellite } = actor;

			await expect(set_satellite(satelliteId, [])).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on unset satellite', async () => {
			const { unset_satellite } = actor;

			await expect(unset_satellite(satelliteId)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testIdentity();
	});

	describe('unknown identity', () => {
		beforeAll(() => {
			actor.setIdentity(Ed25519KeyIdentity.generate());
		});

		testIdentity();
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should have no orbiters set', async () => {
			const { list_orbiters } = actor;

			const results = await list_orbiters();

			expect(results).toHaveLength(0);
		});

		it('should set an orbiter', async () => {
			const { set_orbiter, list_orbiters } = actor;

			const orbiter = await set_orbiter(orbiterId, ['Hello']);

			expect(orbiter.orbiter_id.toText()).toEqual(orbiterId.toText());
			expect(orbiter.created_at).toBeGreaterThan(0n);
			expect(orbiter.updated_at).toBeGreaterThan(0n);

			const results = await list_orbiters();

			expect(results).toHaveLength(1);

			expect(results[0][0].toText()).toEqual(orbiterId.toText());
			expect(results[0][1].orbiter_id.toText()).toEqual(orbiterId.toText());
			expect(results[0][1].created_at).toBeGreaterThan(0n);
			expect(results[0][1].updated_at).toBeGreaterThan(0n);
		});

		it('should unset an orbiter', async () => {
			const { unset_orbiter, list_orbiters } = actor;

			await unset_orbiter(orbiterId);

			const results = await list_orbiters();

			expect(results).toHaveLength(0);
		});

		it('should have no satellites set', async () => {
			const { list_satellites } = actor;

			const results = await list_satellites();

			expect(results).toHaveLength(0);
		});

		it('should set an satellite', async () => {
			const { set_satellite, list_satellites } = actor;

			const satellite = await set_satellite(satelliteId, ['Hello']);

			expect(satellite.satellite_id.toText()).toEqual(satelliteId.toText());
			expect(satellite.created_at).toBeGreaterThan(0n);
			expect(satellite.updated_at).toBeGreaterThan(0n);

			const results = await list_satellites();

			expect(results).toHaveLength(1);

			expect(results[0][0].toText()).toEqual(satelliteId.toText());
			expect(results[0][1].satellite_id.toText()).toEqual(satelliteId.toText());
			expect(results[0][1].created_at).toBeGreaterThan(0n);
			expect(results[0][1].updated_at).toBeGreaterThan(0n);
		});

		it('should unset an satellite', async () => {
			const { unset_satellite, list_satellites } = actor;

			await unset_satellite(satelliteId);

			const results = await list_satellites();

			expect(results).toHaveLength(0);
		});
	});
});
