import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { assertNonNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { toBodyJson } from '../../utils/orbiter-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > Ping', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	const EMAIL_API_KEY = 'test-key';

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
			email_api_key: [EMAIL_API_KEY]
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

		const [pendingHttpOutCall] = await pic.getPendingHttpsOutcalls();

		assertNonNullish(pendingHttpOutCall);

		const { requestId, subnetId, url, headers: headersArray, body } = pendingHttpOutCall;

		expect(url).toEqual(
			'https://europe-west6-juno-observatory.cloudfunctions.net/observatory/notifications/email'
		);

		const headers = headersArray.reduce<Record<string, string>>(
			(acc, [key, value]) => ({ ...acc, [key]: value }),
			{}
		);

		expect(headers['Content-Type']).toEqual('application/json');
		expect(headers['authorization']).toEqual(`Bearer ${EMAIL_API_KEY}`);

		// e.g. rdmx6-jaaaa-aaaaa-aaadq-cai___1620328630000000105___747495116
		const idempotencyKey = headers['idempotency-key'].split('___');
		expect(idempotencyKey[0]).toEqual(mockMissionControlId.toText());
		expect(BigInt(idempotencyKey[1])).toBeGreaterThan(0n);
		expect(Number(idempotencyKey[1])).toBeGreaterThan(0);

		// Finalize
		await pic.mockPendingHttpsOutcall({
			requestId,
			subnetId,
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
