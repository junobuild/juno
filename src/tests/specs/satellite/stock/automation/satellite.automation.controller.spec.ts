import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	assertAutomationController,
	authenticateAutomationAndMakeController
} from '../../../../utils/automation-controller-tests.utils';
import {
	setupSatelliteAutomation,
	type TestAutomation
} from '../../../../utils/automation-tests.utils';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';

describe('Satellite > Automation > Controller', () => {
	let pic: PocketIc;
	let satelliteActor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	let automation: TestAutomation;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			automation: s,
			controller: c
		} = await setupSatelliteAutomation();

		pic = p;
		satelliteActor = actor;
		controller = c;

		automation = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should authenticate automation and use controller to perform a call', async () => {
		await authenticateAutomationAndMakeController({
			pic,
			actor: satelliteActor,
			automation
		});

		await assertAutomationController({
			controller,
			satelliteActor,
			automationIdentity: automation.automationIdentity
		});
	});
});
