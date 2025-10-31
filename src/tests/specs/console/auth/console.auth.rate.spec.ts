import type { ConsoleActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { testAuthRate } from '../../../utils/auth-assertions-rate-tests.utils';
import { setupConsoleAuth } from '../../../utils/auth-tests.utils';
import { configMissionControlRateTokens } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Auth > Rate', async () => {
	let pic: PocketIc;

	let consoleActor: Actor<ConsoleActor>;

	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor },
			controller: c
		} = await setupConsoleAuth();

		pic = p;
		consoleActor = actor;

		controller = c;

		// Set current running rate limiter
		await configMissionControlRateTokens({
			actor: consoleActor,
			controller,
			max_tokens: 2n,
			time_per_token_ns: 60_000_000_000n // 1min = 60000000000n
		});

		await pic.advanceTime(60_000);
		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthRate({
		pic: () => pic,
		actor: () => consoleActor,
		config: (params) =>
			configMissionControlRateTokens({ ...params, actor: consoleActor, controller })
	});
});
