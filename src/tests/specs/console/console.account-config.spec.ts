import type { ConsoleActor, ConsoleDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { authenticateAndMakeIdentity } from '../../utils/auth-identity-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../utils/auth-tests.utils';

describe('Console > Account Config', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	let session: TestSession;

	const setNoCredits = async () => {
		const { set_account_config } = actor;

		const config: ConsoleDid.SetAccountConfig = {
			init_credits: { e8s: 0n },
			version: []
		};

		await set_account_config(config);
	};

	const assertNoCredits = async () => {
		const { get_account } = actor;

		const account = fromNullable(await get_account());
		assertNonNullish(account);

		expect(account.credits.e8s).toEqual(0n);
	};

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor: c },
			controller: cO,
			session: s
		} = await setupConsoleAuth();

		pic = p;

		controller = cO;

		actor = c;

		session = s;

		actor.setIdentity(controller);
		await setNoCredits();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should authenticate and create an account without credits', async () => {
		actor.setIdentity(session.user);

		const { identity } = await authenticateAndMakeIdentity({
			pic,
			session,
			actor
		});

		actor.setIdentity(identity);

		await assertNoCredits();
	});

	it('should create account without credits', async () => {
		const anotherUser = Ed25519KeyIdentity.generate();
		actor.setIdentity(anotherUser);

		const { get_or_init_account } = actor;
		await get_or_init_account();

		await assertNoCredits();
	});
});
