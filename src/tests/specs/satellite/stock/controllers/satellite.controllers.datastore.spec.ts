import { idlFactorySatellite, type SatelliteActor, type SatelliteDid } from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { JUNO_DATASTORE_ERROR_CANNOT_WRITE } from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { tick } from '../../../../utils/pic-tests.utils';
import { createDoc as createDocUtils } from '../../../../utils/satellite-doc-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe.each([
	{ title: 'heap', memory: { Heap: null } },
	{ title: 'stable', memory: { Stable: null } }
])('Satellite > Controllers > Datastore $title', ({ memory }) => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const TEST_COLLECTION = 'test';

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const createDoc = (): Promise<string> =>
		createDocUtils({
			actor,
			collection: TEST_COLLECTION
		});

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);

		const setRule: SatelliteDid.SetRule = {
			memory: toNullable(memory),
			max_size: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(),
			write: { Managed: null },
			version: toNullable(),
			max_capacity: toNullable(),
			rate_config: toNullable(),
			max_changes_per_user: toNullable()
		};

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, setRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each([
		{ title: 'write', scope: { Write: null } }
		// { title: 'submit', scope: { Submit: null } }
	])('Caller is $title', ({ scope }) => {
		const generateController = async (futureMilliseconds?: number) => {
			actor.setIdentity(controller);

			const testController = Ed25519KeyIdentity.generate();

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					...CONTROLLER_METADATA,
					scope,
					expires_at: [
						toBigIntNanoSeconds(new Date((await pic.getTime()) + (futureMilliseconds ?? 0)))
					]
				},
				controllers: [testController.getPrincipal()]
			});

			actor.setIdentity(testController);
		};

		it('should throw on set document', async () => {
			await generateController();

			await pic.advanceTime(100);

			await expect(createDoc()).rejects.toThrowError(JUNO_DATASTORE_ERROR_CANNOT_WRITE);
		});

		it('should throw on get document', async () => {
			const futureMilliseconds = 10_000;

			await generateController(futureMilliseconds);

			const key = await createDoc();

			await pic.advanceTime(futureMilliseconds + 1);
			await tick(pic);

			const { get_doc } = actor;

			expect(await get_doc(TEST_COLLECTION, key)).toEqual([]);
		});
	});
});
