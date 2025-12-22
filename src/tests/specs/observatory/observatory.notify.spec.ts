import { type ConsoleActor, idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import type { NotifyArgs } from '$declarations/observatory/observatory.did';
import { type Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { NO_ACCOUNT_ERROR_MSG } from '../../constants/console-tests.constants';
import {
	CALLER_NOT_ANONYMOUS_MSG,
	OBSERVATORY_ID
} from '../../constants/observatory-tests.constants';
import { initMissionControls, setupConsole } from '../../utils/console-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > Notify', () => {
	let pic: PocketIc;
	let consoleActor: Actor<ConsoleActor>;
	let observatoryActor: Actor<ObservatoryActor>;
	let controller: Ed25519KeyIdentity;

	const mockNotifyArgs: NotifyArgs = {
		kind: {
			FailedCyclesDepositEmail: {
				to: 'test@test.com',
				funding_failure: {
					error_code: { DepositFailed: null },
					timestamp: 1747036399590000000n
				}
			}
		},
		segment: {
			id: mockMissionControlId,
			metadata: [],
			kind: { Orbiter: null }
		},
		user: Ed25519KeyIdentity.generate().getPrincipal()
	};

	beforeAll(async () => {
		const {
			pic: p,
			actor: cConsole,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: true,
			withLedger: false,
			withSegments: true,
			withFee: false
		});

		pic = p;

		controller = cO;

		consoleActor = cConsole;
		consoleActor.setIdentity(controller);

		// Just to have a mission control in memory of the Console.
		await initMissionControls({ actor: consoleActor, pic, length: 1 });

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = c;
		observatoryActor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			observatoryActor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on notify', async () => {
			const { notify } = observatoryActor;

			await expect(notify(mockNotifyArgs)).rejects.toThrow(CALLER_NOT_ANONYMOUS_MSG);
		});
	});

	describe('Random identity', () => {
		const identity = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			observatoryActor.setIdentity(identity);
		});

		it('should throw errors if caller is not a mission control', async () => {
			const { notify } = observatoryActor;

			await expect(notify(mockNotifyArgs)).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
		});

		it('should throw errors if caller is not observatory', async () => {
			const { assert_mission_control_center } = consoleActor;

			await expect(
				assert_mission_control_center({
					mission_control_id: new AnonymousIdentity().getPrincipal(),
					user: new AnonymousIdentity().getPrincipal()
				})
			).rejects.toThrow('Caller is not the observatory.');
		});
	});
});
