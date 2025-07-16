import type { _SERVICE as ObservatoryActor_0_0_9 } from '$declarations/deprecated/observatory-0-0-9.did';
import { idlFactory as idlFactorObservatory_0_0_8 } from '$declarations/deprecated/observatory-0-0-9.factory.did';
import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish } from '@dfinity/utils';
import { beforeEach, describe, expect, inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import {
	mockObservatoryProxyBearerKey,
	testDepositedCyclesNotification
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
				await testDepositedCyclesNotification({
					kind: { MissionControl: null },
					url: 'https://console.juno.build/mission-control',
					moduleName: 'Mission Control',
					actor,
					pic
				});
			});

			it('should still notify Orbiter with previous interface', async () => {
				await testDepositedCyclesNotification({
					kind: { Orbiter: null },
					url: 'https://console.juno.build/analytics',
					moduleName: 'Orbiter',
					actor,
					pic
				});
			});

			it('should still notify Satellite with previous interface', async () => {
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

		it('should preserve controllers even if scope enum is extended', async () => {
			const user1 = Ed25519KeyIdentity.generate();
			const user2 = Ed25519KeyIdentity.generate();
			const admin1 = Ed25519KeyIdentity.generate();

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [['hello', 'world']],
					expires_at: []
				},
				controllers: [user1.getPrincipal(), user2.getPrincipal()]
			});

			await set_controllers({
				controller: {
					scope: { Admin: null },
					metadata: [['super', 'top']],
					expires_at: []
				},
				controllers: [admin1.getPrincipal()]
			});

			const assertControllers = async (actor: ObservatoryActor | ObservatoryActor_0_0_9) => {
				const { list_controllers } = actor;

				const controllers = await list_controllers();

				expect(
					controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
				).not.toBeUndefined();

				const assertWriteController = (controller: Principal) => {
					const maybeUser = controllers.find(([p, _]) => p.toText() === controller.toText());
					assertNonNullish(maybeUser);

					expect(maybeUser[1].scope).toEqual({ Write: null });
					expect(maybeUser[1].metadata).toEqual([['hello', 'world']]);
				};

				assertWriteController(user1.getPrincipal());
				assertWriteController(user2.getPrincipal());

				const maybeAdmin = controllers.find(
					([p, _]) => p.toText() === admin1.getPrincipal().toText()
				);
				assertNonNullish(maybeAdmin);

				expect(maybeAdmin[1].scope).toEqual({ Admin: null });
				expect(maybeAdmin[1].metadata).toEqual([['super', 'top']]);
			};

			await assertControllers(actor);

			await upgradeCurrent();

			const newActor = pic.createActor<ObservatoryActor>(idlFactorObservatory, observatoryId);
			newActor.setIdentity(controller);

			await assertControllers(newActor);
		});
	});
});
