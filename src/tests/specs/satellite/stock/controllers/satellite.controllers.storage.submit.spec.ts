import { idlFactorySatellite, type SatelliteActor, type SatelliteDid } from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_STORAGE_ERROR_ASSET_NOT_FOUND,
	JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { mockListParams } from '../../../../mocks/list.mocks';
import { tick } from '../../../../utils/pic-tests.utils';
import { uploadAsset } from '../../../../utils/satellite-storage-tests.utils';
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

	const upload = async (params: {
		full_path: string;
		name: string;
		collection: string;
		headers?: [string, string][];
		encoding_type?: [] | [string];
	}) => {
		await uploadAsset({
			...params,
			actor
		});
	};

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
		await set_rule({ Storage: null }, TEST_COLLECTION, setRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
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

	it('should throw on upload asset', async () => {
		await pic.advanceTime(100);

		const name = 'hello.html';
		const full_path = `/${TEST_COLLECTION}/${name}`;

		await expect(upload({ full_path, name, collection: TEST_COLLECTION })).rejects.toThrowError(
			JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED
		);
	});

	it('should return empty on get asset', async () => {
		actor.setIdentity(testWriteController);

		const name = 'hello.html';
		const full_path = `/${TEST_COLLECTION}/${name}`;

		await upload({ full_path, name, collection: TEST_COLLECTION });

		const { get_asset } = actor;

		expect(fromNullable(await get_asset(TEST_COLLECTION, full_path))).not.toBeUndefined();

		actor.setIdentity(testSubmitController);

		expect(await get_asset(TEST_COLLECTION, full_path)).toEqual([]);
	});

	it('should throw on delete asset', async () => {
		actor.setIdentity(testWriteController);

		const name = 'hello1.html';
		const full_path = `/${TEST_COLLECTION}/${name}`;

		await upload({ full_path, name, collection: TEST_COLLECTION });

		actor.setIdentity(testSubmitController);

		const { del_asset } = actor;

		await expect(del_asset(TEST_COLLECTION, full_path)).rejects.toThrowError(
			JUNO_STORAGE_ERROR_ASSET_NOT_FOUND
		);
	});

	it('should throw on update asset', async () => {
		actor.setIdentity(testWriteController);

		const name = 'hello2.html';
		const full_path = `/${TEST_COLLECTION}/${name}`;

		await upload({ full_path, name, collection: TEST_COLLECTION });

		const { get_asset } = actor;

		const asset = fromNullable(await get_asset(TEST_COLLECTION, full_path));

		assertNonNullish(asset);

		actor.setIdentity(testSubmitController);

		await expect(upload({ full_path, name, collection: TEST_COLLECTION })).rejects.toThrowError(
			JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED
		);
	});

	it('should return empty on list assets', async () => {
		actor.setIdentity(testWriteController);

		const { list_assets } = actor;

		expect((await list_assets(TEST_COLLECTION, mockListParams)).items_length).toBeGreaterThan(0n);

		actor.setIdentity(testSubmitController);

		expect((await list_assets(TEST_COLLECTION, mockListParams)).items_length).toEqual(0n);
	});
});
