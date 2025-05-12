import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { nowInBigIntNanoSeconds } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';
import { toBodyJson } from '../../utils/orbiter-test.utils';

describe('Observatory > Ping', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactorObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		// The random seed generator init is deferred
		await tick(pic);

		const { set_env } = actor;

		await set_env({
			email_api_key: ['test-key']
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should work yo', async () => {
		const { ping } = actor;

		await ping({
			kind: {
				DepositedCyclesEmail: {
					to: 'test@test.com',
					deposited_cycles: {
						amount: 123456789n,
						timestamp: nowInBigIntNanoSeconds()
					}
				}
			},
			segment: {
				id: mockMissionControlId,
				metadata: [],
				kind: { MissionControl: null }
			},
			user: Ed25519KeyIdentity.generate().getPrincipal()
		});

		await tick(pic);

		const pendingHttpsOutcalls = await pic.getPendingHttpsOutcalls();

		console.log(pendingHttpsOutcalls);

		const pendingGoogleSearchOutcall = pendingHttpsOutcalls[0];

		await pic.mockPendingHttpsOutcall({
			requestId: pendingGoogleSearchOutcall.requestId,
			subnetId: pendingGoogleSearchOutcall.subnetId,
			response: {
				type: 'success',
				body: toBodyJson({}),
				statusCode: 200,
				headers: []
			}
		});

		await tick(pic);
	});
});
