import type { _SERVICE as ObservatoryActor_0_0_9 } from '$declarations/deprecated/observatory-0-0-9.did';
import { idlFactory as idlFactorObservatory_0_0_8 } from '$declarations/deprecated/observatory-0-0-9.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { beforeEach, describe, inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import {
	mockObservatoryProxyBearerKey,
	testDepositCyclesNotification
} from '../../utils/observatory-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { downloadObservatory, OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor_0_0_9>;
	let observatoryId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('v0.0.9 -> v0.1.0', () => {
		const upgradeCurrent = async () => {
			await tick(pic);

			await pic.upgradeCanister({
				canisterId: observatoryId,
				wasm: OBSERVATORY_WASM_PATH,
				sender: controller.getPrincipal()
			});
		};

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadObservatory({ junoVersion: '0.0.41', version: '0.0.9' });

			const { actor: c, canisterId: mId } = await pic.setupCanister<ObservatoryActor_0_0_9>({
				idlFactory: idlFactorObservatory_0_0_8,
				wasm: destination,
				arg: missionControlUserInitArgs(controller.getPrincipal()),
				sender: controller.getPrincipal()
			});

			observatoryId = mId;

			actor = c;
			actor.setIdentity(controller);

			// The random seed generator init is deferred
			await tick(pic);

			const { set_env } = actor;

			await set_env({
				email_api_key: [mockObservatoryProxyBearerKey]
			});

			await upgradeCurrent();

			// The random seed generator init is deferred
			await tick(pic);
		});

		describe('Deposit cycles notifications', () => {
			it('should still notify Mission Control with previous interface', async () => {
				await testDepositCyclesNotification({
					kind: { MissionControl: null },
					url: 'https://console.juno.build/mission-control',
					moduleName: 'Mission Control',
					actor,
					pic
				});
			});

			it('should still notify Orbiter with previous interface', async () => {
				await testDepositCyclesNotification({
					kind: { Orbiter: null },
					url: 'https://console.juno.build/analytics',
					moduleName: 'Orbiter',
					actor,
					pic
				});
			});

			it('should still notify Satellite with previous interface', async () => {
				await testDepositCyclesNotification({
					kind: { Satellite: null },
					url: `https://console.juno.build/satellite/?s=${mockMissionControlId.toText()}`,
					moduleName: 'Satellite',
					actor,
					pic
				});
			});

			it('should notify Satellite with name', async () => {
				await testDepositCyclesNotification({
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
});
