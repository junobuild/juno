import { idlFactorySatellite0016, type SatelliteActor0016 } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { upgradeSatelliteVersion } from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.0.21', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	let actor: Actor<SatelliteActor0016>;

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite('0.0.20');

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor0016>({
			idlFactory: idlFactorySatellite0016,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should not populate an index HTML file', async () => {
		await upgradeSatelliteVersion({ version: '0.0.21', controller, pic, canisterId });

		const { http_request } = actor;

		const { status_code } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/'
		});

		expect(status_code).toBe(404);
	});
});
