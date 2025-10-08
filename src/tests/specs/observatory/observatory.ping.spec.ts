import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import {
	mockObservatoryProxyBearerKey,
	testDepositedCyclesNotification,
	testFailedDepositCyclesNotification
} from '../../utils/observatory-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > Ping', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		// The random seed generator init is deferred
		await tick(pic);

		const { set_env } = actor;

		await set_env({
			email_api_key: [mockObservatoryProxyBearerKey]
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Deposited cycles notifications', () => {
		it('should notify Mission Control', async () => {
			await testDepositedCyclesNotification({
				kind: { MissionControl: null },
				url: 'https://console.juno.build/mission-control',
				moduleName: 'Mission Control',
				actor,
				pic
			});
		});

		it('should notify Orbiter', async () => {
			await testDepositedCyclesNotification({
				kind: { Orbiter: null },
				url: 'https://console.juno.build/analytics',
				moduleName: 'Orbiter',
				actor,
				pic
			});
		});

		it('should notify Satellite', async () => {
			await testDepositedCyclesNotification({
				kind: { Satellite: null },
				url: `https://console.juno.build/satellite/?s=${mockMissionControlId.toText()}`,
				moduleName: 'Satellite',
				actor,
				pic
			});
		});

		it('should notify Satellite with name', async () => {
			await testDepositedCyclesNotification({
				kind: { Satellite: null },
				url: `https://console.juno.build/satellite/?s=${mockMissionControlId.toText()}`,
				moduleName: 'Satellite',
				metadataName: 'This is a test name',
				actor,
				pic
			});
		});
	});

	describe('Failed deposit cycles notifications', () => {
		it('should notify Mission Control', async () => {
			await testFailedDepositCyclesNotification({
				kind: { MissionControl: null },
				url: 'https://console.juno.build/mission-control',
				moduleName: 'Mission Control',
				actor,
				pic
			});
		});

		it('should notify Orbiter', async () => {
			await testFailedDepositCyclesNotification({
				kind: { Orbiter: null },
				url: 'https://console.juno.build/analytics',
				moduleName: 'Orbiter',
				actor,
				pic
			});
		});

		it('should notify Satellite', async () => {
			await testFailedDepositCyclesNotification({
				kind: { Satellite: null },
				url: `https://console.juno.build/satellite/?s=${mockMissionControlId.toText()}`,
				moduleName: 'Satellite',
				actor,
				pic
			});
		});

		it('should notify Satellite with name', async () => {
			await testFailedDepositCyclesNotification({
				kind: { Satellite: null },
				url: `https://console.juno.build/satellite/?s=${mockMissionControlId.toText()}`,
				moduleName: 'Satellite',
				metadataName: 'This is a test name',
				actor,
				pic
			});
		});
	});
});
