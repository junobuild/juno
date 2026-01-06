import {
	idlFactoryConsole,
	idlFactoryConsole020,
	idlFactoryMissionControl,
	type ConsoleActor,
	type ConsoleActor020,
	type MissionControlActor
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { updateRateConfig } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > Rates > v0.2.0 -> v0.3.0', () => {
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
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should provide rates with new interfaces and default of new factory_fees', async () => {
		await updateRateConfig({ actor });

		await upgradeCurrent();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(user);

		const { get_rate_config } = newActor;

		await expect(get_rate_config({ Satellite: null })).resolves.toEqual({
			max_tokens: 100,
			time_per_token_ns: 600_000_000
		});
		await expect(get_rate_config({ Orbiter: null })).resolves.toEqual({
			max_tokens: 100,
			time_per_token_ns: 600_000_000
		});

		await expect(get_rate_config({ MissionControl: null })).resolves.toEqual({
			max_tokens: 100,
			time_per_token_ns: 600_000_000
		});
	});
});
