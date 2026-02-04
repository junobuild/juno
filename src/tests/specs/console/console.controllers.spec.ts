import { type ConsoleActor, type ConsoleDid, idlFactoryConsole } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish } from '@dfinity/utils';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { CONTROLLER_METADATA } from '../../constants/controller-tests.constants';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Controllers', () => {
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

	const assertControllers = (actor: () => ConsoleActor) => {
		it('should throw errors on creating controller', async () => {
			const { set_controllers } = actor();

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						...CONTROLLER_METADATA,
						scope: { Admin: null }
					}
				})
			).rejects.toThrowError(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor();

			await expect(list_controllers()).rejects.toThrowError(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deleting controller', async () => {
			const { del_controllers } = actor();

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrowError(CONTROLLER_ERROR_MSG);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertControllers(() => actor);
	});

	describe('Some user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		assertControllers(() => actor);
	});

	describe('Controller', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should add and remove additional controller', async () => {
			const { set_controllers, del_controllers, list_controllers } = actor;

			const newController = Ed25519KeyIdentity.generate();

			const controllerData: ConsoleDid.SetController = {
				scope: { Admin: null },
				expires_at: [123n],
				kind: [{ Automation: null }],
				metadata: [['hello', 'world']]
			};

			await set_controllers({
				controllers: [newController.getPrincipal()],
				controller: controllerData
			});

			const addControllers = await list_controllers();

			expect(addControllers).toHaveLength(2);

			expect(
				addControllers.find(([p]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();

			const newAddedController = addControllers.find(
				([p]) => p.toText() === newController.getPrincipal().toText()
			);

			assertNonNullish(newAddedController);

			expect(newAddedController[1].metadata).toEqual(controllerData.metadata);
			expect(newAddedController[1].scope).toEqual(controllerData.scope);
			expect(newAddedController[1].expires_at).toEqual(controllerData.expires_at);
			expect(newAddedController[1].kind).toEqual(controllerData.kind);

			await del_controllers({
				controllers: [newController.getPrincipal()]
			});

			const updatedControllers = await list_controllers();

			expect(updatedControllers).toHaveLength(1);
			expect(updatedControllers[0][0].toText()).toEqual(controller.getPrincipal().toText());
		});
	});
});
