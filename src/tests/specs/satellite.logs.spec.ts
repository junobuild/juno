import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { idlFactory as idlTestFactorySatellite } from '$test-declarations/test_satellite/test_satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from './mocks/collection.mocks';
import { tick } from './utils/pic-tests.utils';
import { createDoc as createDocUtils } from './utils/satellite-doc-tests.utils';
import { controllersInitArgs, TEST_SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite Logging', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId } = await pic.setupCanister<TestSatelliteActor>({
			idlFactory: idlTestFactorySatellite,
			wasm: TEST_SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await tick(pic);

		// The random number generator is only initialized on upgrade because dev that do not use serverless functions do not need it
		await pic.upgradeCanister({
			canisterId,
			wasm: TEST_SATELLITE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		// Wait for post_upgrade to kicks in since we defer instantiation of random
		await tick(pic);

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should log an info when on_set_doc hook is fired', async () => {
		await createDocUtils({
			actor,
			collection: TEST_COLLECTION
		});

		// Wait for the serverless function to being fired
		await tick(pic);

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', {
			matcher: toNullable(),
			order: toNullable(),
			owner: toNullable(),
			paginate: toNullable()
		});

		expect(logs).toHaveLength(1);

		const [log, _] = logs;
		const [__, doc] = log;

		const data = await fromArray(doc.data);

		expect(data).toEqual({
			data: null,
			level: 'Info',
			message: 'Hello world'
		});
	});
});
