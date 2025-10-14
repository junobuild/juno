import { type ConsoleActor, type ConsoleDid, idlFactoryConsole } from '$declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Storage', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each([
		{ title: 'Anonymous', user: new AnonymousIdentity() },
		{ title: 'Some identity', user: Ed25519KeyIdentity.generate() }
	])('$title', ({ user }) => {
		const ERROR_NOT_ADMIN_CONTROLLER = 'Caller is not a controller of the console.';

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should throw errors on setting storage config', async () => {
			const { set_storage_config } = actor;

			await expect(
				set_storage_config({
					headers: [],
					iframe: toNullable(),
					redirects: toNullable(),
					rewrites: [],
					raw_access: toNullable(),
					max_memory_size: toNullable(),
					version: toNullable()
				})
			).rejects.toThrow(ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on setting auth config', async () => {
			const { set_auth_config } = actor;

			const config: ConsoleDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				openid: [],
				version: []
			};

			await expect(set_auth_config(config)).rejects.toThrow(ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting storage config', async () => {
			const { get_storage_config } = actor;

			await expect(get_storage_config()).rejects.toThrow(ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting auth config', async () => {
			const { get_auth_config } = actor;

			await expect(get_auth_config()).rejects.toThrow(ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting config', async () => {
			const { get_config } = actor;

			await expect(get_config()).rejects.toThrow(ERROR_NOT_ADMIN_CONTROLLER);
		});
	});
});
