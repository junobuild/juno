import {
	idlFactoryConsole,
	idlFactoryConsole020,
	idlFactoryMissionControl,
	type ConsoleActor,
	type ConsoleActor020,
	type MissionControlActor
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { deploySegments, updateRateConfig } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > v0.2.0 -> v0.3.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor020>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const user = Ed25519KeyIdentity.generate();

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const createMissionControlAndSatellite = async ({ user }: { user: Identity }) => {
		actor.setIdentity(user);

		const { init_user_mission_control_center } = actor;
		const missionControl = await init_user_mission_control_center();

		const missionControlId = fromNullable(missionControl.mission_control_id);

		assertNonNullish(missionControlId);

		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(user);

		const { create_satellite } = micActor;
		await create_satellite('test');
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadConsole({ junoVersion: '0.0.62', version: '0.2.0' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor020>({
			idlFactory: idlFactoryConsole020,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);

		await updateRateConfig({ actor });

		await deploySegments({ actor });

		// Consumes starting credits otherwise get_create_fee will return None
		await createMissionControlAndSatellite({ user });

		// Create mission control requires the user to be a caller of the Console
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should still provide fees', async () => {
		const { set_fee } = actor;

		await set_fee({ Satellite: null }, { e8s: 40_000_000n });
		await set_fee({ Orbiter: null }, { e8s: 77_000_000n });

		await upgradeCurrent();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(user);

		const { get_create_fee } = newActor;

		await expect(get_create_fee({ Satellite: null })).resolves.toEqual(toNullable({ e8s: 40_000_000n }));
		await expect(get_create_fee({ Orbiter: null })).resolves.toEqual(toNullable({ e8s: 77_000_000n }));
	});
});
