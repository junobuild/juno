import { type SatelliteActor } from '$lib/api/actors/actor.factory';
import type { SatelliteDid } from '$lib/types/declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, fromNullishNullable } from '@dfinity/utils';
import { MEMORIES } from '../../../constants/satellite-tests.constants';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe.each([{ title: 'Heap (default)', memory: null }, ...MEMORIES])(
	'Satellite > Init > $title',
	({ memory }) => {
		let pic: PocketIc;
		let actor: Actor<SatelliteActor>;
		let controller: Ed25519KeyIdentity;

		const controller1 = Ed25519KeyIdentity.generate();
		const controller2 = Ed25519KeyIdentity.generate();
		const controller3 = Ed25519KeyIdentity.generate();

		const controllers = [controller1, controller2, controller3].map((c) => c.getPrincipal());

		beforeAll(async () => {
			const {
				actor: a,
				pic: p,
				controller: cId
			} = await setupSatelliteStock({
				withIndexHtml: true,
				memory,
				controllers
			});

			pic = p;
			actor = a;
			controller = cId;

			actor.setIdentity(controller);
		});

		afterAll(async () => {
			await pic?.tearDown();
		});

		const assertMemory = async ({
			memory,
			collection
		}: {
			memory: SatelliteDid.Memory;
			collection: string;
		}) => {
			const { get_rule } = actor;

			const result = fromNullable(await get_rule({ Storage: null }, collection));

			const ruleMemory = fromNullishNullable(result?.memory);

			expect(ruleMemory).toEqual(memory);
		};

		it('should init satellite with system storage using selected memory', async () => {
			await assertMemory({
				memory: memory ?? { Heap: null },
				collection: '#_juno/releases'
			});

			await assertMemory({
				memory: memory ?? { Heap: null },
				collection: '#dapp'
			});
		});

		it('should init satellite with controller', async () => {
			const { list_controllers } = actor;

			const controllers = await list_controllers();

			expect(controllers).toHaveLength(4);

			expect(
				controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();
			expect(
				controllers.find(([p, _]) => p.toText() === controller1.getPrincipal().toText())
			).not.toBeUndefined();
			expect(
				controllers.find(([p, _]) => p.toText() === controller2.getPrincipal().toText())
			).not.toBeUndefined();
			expect(
				controllers.find(([p, _]) => p.toText() === controller3.getPrincipal().toText())
			).not.toBeUndefined();
		});
	}
);
