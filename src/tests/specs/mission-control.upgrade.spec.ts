import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { tick } from './utils/pic-tests.utils';
import { downloadMissionControl } from './utils/setup-tests.utils';

describe('Mission control > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let missionControlId: Principal;
	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	describe('v0.0.13 -> v0.0.14', () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadMissionControl('0.0.13');

			const { actor: c, canisterId: mId } = await pic.setupCanister<MissionControlActor>({
				idlFactory: idlFactorMissionControl,
				wasm: destination,
				arg: missionControlUserInitArgs(controller.getPrincipal()),
				sender: controller.getPrincipal()
			});

			missionControlId = mId;

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

		const upgrade0_0_14 = async () => {
			await tick(pic);

			const destination = await downloadMissionControl('0.0.14');

			await pic.upgradeCanister({
				canisterId: missionControlId,
				wasm: destination,
				sender: controller.getPrincipal()
			});
		};

		const orbiterName = 'Hello 1';
		const satelliteName = 'Hello 2';

		const setModules = async () => {
			const { set_orbiter, set_satellite } = actor;

			await set_orbiter(orbiterId, [orbiterName]);
			await set_satellite(satelliteId, [satelliteName]);
		};

		const testModules = async () => {
			const { list_orbiters, list_satellites } = actor;

			const satellites = await list_satellites();

			expect(satellites).toHaveLength(1);

			expect(satellites[0][0].toText()).toEqual(satelliteId.toText());
			expect(satellites[0][1].satellite_id.toText()).toEqual(satelliteId.toText());
			expect(satellites[0][1].created_at).toBeGreaterThan(0n);
			expect(satellites[0][1].updated_at).toBeGreaterThan(0n);

			const [_, satName] = satellites[0][1].metadata.find(([key]) => key === 'name') ?? [];
			expect(satName).toEqual(satelliteName);

			const orbiters = await list_orbiters();

			expect(orbiters).toHaveLength(1);

			expect(orbiters[0][0].toText()).toEqual(orbiterId.toText());
			expect(orbiters[0][1].orbiter_id.toText()).toEqual(orbiterId.toText());
			expect(orbiters[0][1].created_at).toBeGreaterThan(0n);
			expect(orbiters[0][1].updated_at).toBeGreaterThan(0n);

			const [__, orbName] = orbiters[0][1].metadata.find(([key]) => key === 'name') ?? [];
			expect(orbName).toEqual(orbiterName);
		};

		const testUser = async () => {
			const { get_user } = actor;
			const user = await get_user();

			expect(user.toText()).toEqual(controller.getPrincipal().toText());
		};

		it(
			'should still contains data after upgrade even if the internal state variable is renamed from state to heap',
			{ timeout: 60000 },
			async () => {
				await setModules();

				await testModules();
				await testUser();

				await upgrade0_0_14();

				actor = pic.createActor<MissionControlActor>(idlFactorMissionControl, missionControlId);
				actor.setIdentity(controller);

				await testModules();
				await testUser();
			}
		);

		it('should migrate with no settings', async () => {
			await upgrade0_0_14();

			actor = pic.createActor<MissionControlActor>(idlFactorMissionControl, missionControlId);
			actor.setIdentity(controller);

			const { get_settings } = actor;
			const settings = await get_settings();

			expect(fromNullable(settings)).toBeUndefined();
		});
	});
});
