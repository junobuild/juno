import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect } from 'vitest';
import { mockListParams } from './mocks/list.mocks';
import { tick } from './utils/pic-tests.utils';
import { setupTestSatellite } from './utils/satellite-fixtures-tests.utils';

describe('Satellite > Hooks', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let controller: Identity;

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c } = await setupTestSatellite();

		pic = p;
		actor = a;
		controller = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const waitServerlessFunction = async () => {
		// Wait for the serverless function to being fired
		await tick(pic);
	};

	it('should log a warn because on_init_sync should has been fired', async () => {
		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

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
