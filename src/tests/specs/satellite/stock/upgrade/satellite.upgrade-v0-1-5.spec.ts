import { idlFactorySatellite, type SatelliteActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { fetchLogs } from '../../../../utils/mgmt-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { upgradeSatellite } from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.1.5', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	let actor: Actor<SatelliteActor>;

	const PREVIOUS_VERSION = '0.1.4';

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite(PREVIOUS_VERSION);

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
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

	it('should generate a salt for the authentication', async () => {
		await upgradeSatellite({ pic, canisterId, controller });

		await tick(pic);

		const logs = await fetchLogs({
			pic,
			controller,
			canisterId
		});

		const expectedLogMessage = 'Authentication salt generated.';

		const log = logs.find(([_, { message }]) => message === expectedLogMessage);

		expect(log).not.toBeUndefined();
	});
});
