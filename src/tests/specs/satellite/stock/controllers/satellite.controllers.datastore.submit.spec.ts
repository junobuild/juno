import { idlFactorySatellite, type SatelliteActor, type SatelliteDid } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { JUNO_DATASTORE_ERROR_CANNOT_WRITE } from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { mockListParams } from '../../../../mocks/list.mocks';
import { createDoc as createDocUtils } from '../../../../utils/satellite-doc-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe.each([
	{ title: 'heap', memory: { Heap: null } },
	{ title: 'stable', memory: { Stable: null } }
])('Satellite > Controllers > Datastore $title > Submit', ({ memory }) => {
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

	let testWriteController: Ed25519KeyIdentity;
	let testSubmitController: Ed25519KeyIdentity;

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

	beforeEach(async () => {
		actor.setIdentity(controller);

		testWriteController = Ed25519KeyIdentity.generate();
		testSubmitController = Ed25519KeyIdentity.generate();

		const { set_controllers } = actor;

		await set_controllers({
			controller: {
				...CONTROLLER_METADATA,
				scope: { Write: null }
			},
			controllers: [testWriteController.getPrincipal()]
		});

		await set_controllers({
			controller: {
				...CONTROLLER_METADATA,
				scope: { Submit: null }
			},
			controllers: [testSubmitController.getPrincipal()]
		});

		actor.setIdentity(testSubmitController);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should throw on set document', async () => {
		await pic.advanceTime(100);

		await expect(createDoc()).rejects.toThrowError(JUNO_DATASTORE_ERROR_CANNOT_WRITE);
	});

	it('should return empty on get document', async () => {
		actor.setIdentity(testWriteController);

		const key = await createDoc();

		const { get_doc } = actor;

		expect(fromNullable(await get_doc(TEST_COLLECTION, key))).not.toBeUndefined();

		actor.setIdentity(testSubmitController);

		await expect(get_doc(TEST_COLLECTION, key)).resolves.toEqual([]);
	});

	it('should throw on delete document', async () => {
		actor.setIdentity(testWriteController);

		const key = await createDoc();

		actor.setIdentity(testSubmitController);

		const { del_doc } = actor;

		await expect(del_doc(TEST_COLLECTION, key, { version: [1n] })).rejects.toThrowError(
			JUNO_DATASTORE_ERROR_CANNOT_WRITE
		);
	});

	it('should throw on update document', async () => {
		actor.setIdentity(testWriteController);

		const key = await createDoc();

		const { get_doc } = actor;

		const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

		assertNonNullish(doc);

		actor.setIdentity(testSubmitController);

		const { set_doc } = actor;

		await expect(
			set_doc(TEST_COLLECTION, key, {
				...doc,
				version: doc.version
			})
		).rejects.toThrowError(JUNO_DATASTORE_ERROR_CANNOT_WRITE);
	});

	it('should return empty on list documents', async () => {
		actor.setIdentity(testWriteController);

		const { list_docs } = actor;

		expect((await list_docs(TEST_COLLECTION, mockListParams)).items_length).toBeGreaterThan(0n);

		actor.setIdentity(testSubmitController);

		expect((await list_docs(TEST_COLLECTION, mockListParams)).items_length).toEqual(0n);
	});
});
