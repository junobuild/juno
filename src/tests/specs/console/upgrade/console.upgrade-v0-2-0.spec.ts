import {
	idlFactoryConsole,
	idlFactoryConsole015,
	type ConsoleActor,
	type ConsoleActor015
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import {
	deploySegments,
	deprecatedInitMissionControls,
	updateRateConfig
} from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > v0.1.5 -> v0.2.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor015>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadConsole({ junoVersion: '0.0.61', version: '0.1.5' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor015>({
			idlFactory: idlFactoryConsole015,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);

		await updateRateConfig({ actor });

		await deploySegments({ actor });
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	const testUserAccounts = async ({
		actor,
		users
	}: {
		users: Identity[];
		actor: Actor<ConsoleActor>;
	}) => {
		const { list_accounts } = actor;

		const missionControls = await list_accounts();

		expect(missionControls).toHaveLength(users.length);

		for (const user of users) {
			expect(
				missionControls.find(([key]) => key.toText() === user.getPrincipal().toText())
			).not.toBeUndefined();
		}
	};

	it('should still provide mission control (users) after move to accounts', async () => {
		const originalUsers = await deprecatedInitMissionControls({ actor, pic, length: 3 });

		await upgradeCurrent();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		await testUserAccounts({ users: originalUsers, actor: newActor });
	});
});
