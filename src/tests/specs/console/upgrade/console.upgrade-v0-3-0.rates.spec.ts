import {
	idlFactoryConsole,
	idlFactoryConsole020,
	type ConsoleActor,
	type ConsoleActor020
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { updateRateConfig } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { controllersInitArgs, downloadConsole } from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > Rates > v0.2.0 -> v0.3.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor020>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		const destination = await downloadConsole({ junoVersion: '0.0.64', version: '0.3.0' });

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
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

		await upgrade();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { get_rate_config } = newActor;

		await expect(get_rate_config({ Satellite: null })).resolves.toEqual({
			max_tokens: 100n,
			time_per_token_ns: 600_000_000n
		});
		await expect(get_rate_config({ Orbiter: null })).resolves.toEqual({
			max_tokens: 100n,
			time_per_token_ns: 600_000_000n
		});

		await expect(get_rate_config({ MissionControl: null })).resolves.toEqual({
			max_tokens: 100n,
			time_per_token_ns: 600_000_000n
		});
	});
});
