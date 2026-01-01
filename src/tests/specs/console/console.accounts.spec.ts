import { idlFactoryConsole, type ConsoleActor, type ConsoleDid } from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { ANONYMOUS_ERROR_MSG } from '../../constants/console-tests.constants';
import { deploySegments, initAccounts } from '../../utils/console-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Accounts', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments({ actor });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Guard', () => {
		describe('Anonymous', () => {
			beforeEach(() => {
				actor.setIdentity(new AnonymousIdentity());
			});

			it('should throw error on get_account', async () => {
				const { get_account } = actor;

				await expect(get_account()).rejects.toThrowError(ANONYMOUS_ERROR_MSG);
			});

			it('should throw error on get_or_init_account', async () => {
				const { get_or_init_account } = actor;

				await expect(get_or_init_account()).rejects.toThrowError(ANONYMOUS_ERROR_MSG);
			});
		});

		it('should throw errors if too many accounts are created quickly', async () => {
			await expect(initAccounts({ actor, pic, length: 2 })).rejects.toThrowError(
				new RegExp('Rate limit reached, try again later', 'i')
			);
		});
	});

	describe('User', () => {
		let user: Identity;
		let account: ConsoleDid.Account | undefined;

		beforeAll(async () => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			await pic.advanceTime(1_000 * 60 * 10);
		});

		it('should not get unknown account', async () => {
			const { get_account } = actor;

			account = fromNullable(await get_account());

			expect(account).toBeUndefined();
		});

		it('should init a new account', async () => {
			const { get_or_init_account } = actor;

			account = await get_or_init_account();

			expect(account).not.toBeUndefined();
		});

		it('should have created account with owner id', () => {
			assertNonNullish(account);

			expect(account.owner.toText()).toEqual(user.getPrincipal().toText());
		});

		it('should retrieve same account with get or init', async () => {
			const { get_or_init_account } = actor;

			const retrievedAccount = await get_or_init_account();

			assertNonNullish(account);

			expect(account).toStrictEqual(retrievedAccount);
		});

		it('should retrieve same account', async () => {
			const { get_account } = actor;

			const retrievedAccount = fromNullable(await get_account());

			assertNonNullish(account);

			expect(account).toStrictEqual(retrievedAccount);
		});

		it('should retrieve a different account for another user', async () => {
			const otherUser = Ed25519KeyIdentity.generate();
			actor.setIdentity(otherUser);

			await pic.advanceTime(1_000 * 60 * 10);

			const { get_or_init_account } = actor;

			const otherAccount = await get_or_init_account();

			assertNonNullish(account);

			expect(account).not.toStrictEqual(otherAccount);
			expect(otherAccount.owner.toText()).toEqual(otherUser.getPrincipal().toString());
		});
	});
});
