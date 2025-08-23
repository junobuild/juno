import type { _SERVICE as SatelliteActor_0_0_16 } from '$declarations/deprecated/satellite-0-0-16.did';
import { idlFactory as idlFactorSatellite_0_0_16 } from '$declarations/deprecated/satellite-0-0-16.factory.did';
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

	afterEach(async () => {
		await pic?.tearDown();
	});

	let actor: Actor<SatelliteActor_0_0_16>;

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite('0.0.20');

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
			idlFactory: idlFactorSatellite_0_0_16,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
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
