import { type ConsoleActor, idlFactoryConsole } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > v0.4.3 -> v0.4.4', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadConsole({ junoVersion: '0.0.72', version: '0.4.2' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
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

	it('should provide fees for ufo', async () => {
		await upgrade();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { get_fee } = newActor;

		const feesWithIcp = [{ Satellite: null }, { Orbiter: null }];
		const feesWithoutIcp = [{ Ufo: null }, { MissionControl: null }];

		for (const fee of feesWithIcp) {
			await expect(get_fee(fee)).resolves.toEqual(
				expect.objectContaining({
					fee_icp: toNullable({ e8s: 150_000_000n }),
					fee_cycles: { e12s: 3_000_000_000_000n }
				})
			);
		}

		for (const fee of feesWithoutIcp) {
			await expect(get_fee(fee)).resolves.toEqual(
				expect.objectContaining({
					fee_icp: toNullable(),
					fee_cycles: { e12s: 3_000_000_000_000n }
				})
			);
		}
	});

	it('should provide rates config for ufo', async () => {
		await upgrade();
		
		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { get_rate_config } = newActor;

		const rates = [{ Ufo: null }, { MissionControl: null }, { Satellite: null }, { Orbiter: null }];

		for (const rate of rates) {
			await expect(get_rate_config(rate)).resolves.toEqual({
				max_tokens: 100n,
				time_per_token_ns: 600_000_000n
			});
		}
	});
});
