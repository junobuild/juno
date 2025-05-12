import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { isNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import type { IncomingMessage } from 'node:http';
import { inject } from 'vitest';
import { mockMissionControlId } from '../../../frontend/tests/mocks/modules.mock';
import { buildServer } from '../../utils/observatory-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

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

	it('should work', () =>
		new Promise<void>(async (done) => {
			const server = buildServer();

			const onRequest = (request: IncomingMessage) => {
				const {
					url,
					headers: { host }
				} = request;

				if (isNullish(url)) {
					return;
				}

				const { pathname } = new URL(url, `http://${host}`);

				if (pathname !== '/observatory/notifications/email') {
					return;
				}

				// TODO
				let body: Uint8Array[] = [];
				request
					.on('data', (chunk) => {
						body.push(chunk);
					})
					.on('end', () => {
						console.log(Buffer.concat(body).toString());
					});

				done();
			};

			server.on('request', onRequest);
			server.listen(4444);

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
		}));
});
