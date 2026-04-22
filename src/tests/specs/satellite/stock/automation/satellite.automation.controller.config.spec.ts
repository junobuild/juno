import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { authenticateAutomationAndMakeController } from '../../../../utils/automation-controller-tests.utils';
import {
	setupSatelliteAutomation,
	type TestAutomation
} from '../../../../utils/automation-tests.utils';

describe('Satellite > Automation > Controller > Config', () => {
	let pic: PocketIc;
	let satelliteActor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	let automation: TestAutomation;

	const oneMin = 60n * 1_000_000_000n;
	const customMaxTimeToLive = oneMin * 25n; // 25min in nanoseconds

	beforeAll(async () => {
		const controllerConfig: SatelliteDid.OpenIdAutomationProviderControllerConfig = {
			scope: [{ Submit: null }],
			max_time_to_live: [customMaxTimeToLive]
		};

		const {
			pic: p,
			satellite: { actor },
			automation: s,
			controller: c
		} = await setupSatelliteAutomation({
			controllerConfig
		});

		pic = p;
		satelliteActor = actor;
		controller = c;

		automation = s;

		await authenticateAutomationAndMakeController({
			pic,
			actor: satelliteActor,
			automation
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should authenticate with a custom scope', async () => {
		satelliteActor.setIdentity(controller);

		const { list_controllers: admin_list_controllers } = satelliteActor;

		const controllers = await admin_list_controllers();

		const automatedController = controllers.find(
			([p, _]) => p.toText() === automation.automationIdentity.getPrincipal().toText()
		);

		expect(automatedController).not.toBeUndefined();
		expect('Submit' in (automatedController?.[1].scope ?? {})).toBeTruthy();
	});

	it('should authenticate with a custom expiration', async () => {
		satelliteActor.setIdentity(controller);

		const { list_controllers: admin_list_controllers } = satelliteActor;

		const controllers = await admin_list_controllers();

		const automatedController = controllers.find(
			([p, _]) => p.toText() === automation.automationIdentity.getPrincipal().toText()
		);

		const expiresAt = fromNullable(automatedController?.[1].expires_at ?? []);

		const now = await pic.getTime();

		expect(expiresAt).not.toBeUndefined();
		expect(expiresAt).toBeGreaterThanOrEqual(BigInt(now * 1_000_000) - oneMin); // 1min as test margin
		expect(expiresAt).toBeLessThan(BigInt(now * 1_000_000) + customMaxTimeToLive + oneMin); // 1min as test margin
	});
});
