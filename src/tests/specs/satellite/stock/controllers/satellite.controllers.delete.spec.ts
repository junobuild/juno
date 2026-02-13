import { idlFactorySatellite, type SatelliteActor } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Controllers > Delete', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each([
		{ title: 'write', scope: { Write: null } },
		{ title: 'submit', scope: { Submit: null } }
	])('With scope $title', ({ scope }) => {
		let testController: Ed25519KeyIdentity;

		beforeAll(async () => {
			testController = Ed25519KeyIdentity.generate();

			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					...CONTROLLER_METADATA,
					scope
				},
				controllers: [testController.getPrincipal()]
			});

			actor.setIdentity(testController);
		});

		it('should remove controller with del_controller_self', async () => {
			const { del_controller_self } = actor;

			await del_controller_self();

			actor.setIdentity(controller);

			const { list_controllers } = actor;

			const controllers = await list_controllers();

			expect(
				controllers.find(([p, _]) => p.toText() === testController.getPrincipal().toText())
			).toBeUndefined();

			expect(
				controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();
		});
	});
});
