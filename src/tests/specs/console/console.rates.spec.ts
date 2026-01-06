import { idlFactoryConsole, type ConsoleActor } from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { deploySegments, initUserAccounts } from '../../utils/console-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Rates', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;

		await deploySegments({ actor });
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	const assertGuard = async (identity: Identity) => {
		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(identity);

		const { set_rate_config, get_rate_config } = newActor;

		const config = {
			max_tokens: 100n,
			time_per_token_ns: 60n
		};

		await expect(set_rate_config({ Satellite: null }, config)).rejects.toThrowError(
			CONTROLLER_ERROR_MSG
		);

		await expect(get_rate_config({ Satellite: null })).rejects.toThrowError(CONTROLLER_ERROR_MSG);
	};

	it('should throw on set_fee with some identity', async () => {
		await assertGuard(Ed25519KeyIdentity.generate());
	});

	it('should throw on set_fee with anonymous identity', async () => {
		await assertGuard(new AnonymousIdentity());
	});

	it('should throw errors if too many users are created quickly', async () => {
		await expect(initUserAccounts({ actor, pic, length: 2 })).rejects.toThrowError(
			new RegExp('Rate limit reached, try again later', 'i')
		);
	});
});
