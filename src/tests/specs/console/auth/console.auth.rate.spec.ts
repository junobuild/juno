import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { testAuthRate } from '../../../utils/auth-assertions-rate-tests.utils';
import { setupConsoleAuth } from '../../../utils/auth-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Auth > Rate', () => {
	let pic: PocketIc;

	let consoleActor: Actor<ConsoleActor>;

	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor },
			controller: c
		} = await setupConsoleAuth({ withApplyRateTokens: false });

		pic = p;
		consoleActor = actor;

		controller = c;

		// Set current running rate limiter
		await config({
			max_tokens: 2n,
			time_per_token_ns: 60_000_000_000n // 1min = 60000000000n
		});

		await pic.advanceTime(60_000);
		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const config = async ({
		max_tokens,
		time_per_token_ns
	}: {
		max_tokens: bigint;
		time_per_token_ns: bigint;
	}) => {
		consoleActor.setIdentity(controller);

		const { update_rate_config } = consoleActor;

		await update_rate_config(
			{ MissionControl: null },
			{
				max_tokens,
				time_per_token_ns
			}
		);

		await tick(pic);
	};

	testAuthRate({
		pic: () => pic,
		actor: () => consoleActor,
		config
	});
});
