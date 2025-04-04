import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { type Actor, PocketIc } from '@hadronous/pic';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import { crateVersion } from '../../../utils/version-test.utils';

describe('Satellite > Extened > Version', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: a } = await setupTestSatellite();

		actor = a;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should expose custom build version', async () => {
		const version = await actor.build_version();

		const satelliteVersion = crateVersion('satellite');
		expect(version).not.toEqual(satelliteVersion);

		const extendedSatelliteVersion = crateVersion(join('tests', 'fixtures', 'test_satellite'));
		expect(version).toEqual(extendedSatelliteVersion);
	});

	it('should expose satellite version', async () => {
		const satelliteVersion = crateVersion('satellite');

		expect(await actor.version()).toEqual(satelliteVersion);
	});
});
