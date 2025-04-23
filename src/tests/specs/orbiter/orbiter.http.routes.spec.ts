import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { HttpRequest } from '$declarations/satellite/satellite.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
import { assertCertification } from '../../utils/certification-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > HTTP > Routes', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const NON_POST_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

	const RESPONSE_404 = { err: { code: 404, message: 'Not found' } };
	const RESPONSE_405 = { err: { code: 405, message: 'Method not allowed' } };

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;

		// Certified responses are initialized asynchronously
		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each(['/something', '/'])('Route not found for %s', (url) => {
		it.each([...NON_POST_METHODS, 'POST'])(
			'should return a certified not found response for %s',
			async (method) => {
				const { http_request } = actor;

				const request: HttpRequest = {
					body: [],
					certificate_version: toNullable(2),
					headers: [],
					method,
					url
				};

				const response = await http_request(request);

				expect(
					response.headers.find(([key, _value]) => key.toLowerCase() === 'content-type')?.[1]
				).toEqual('application/json');

				const decoder = new TextDecoder();
				const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

				expect(JSON.parse(responseBody)).toEqual(RESPONSE_404);

				await assertCertification({
					canisterId,
					pic,
					request,
					response,
					currentDate,
					statusCode: 404
				});
			}
		);
	});

	describe.each(['/view/something', '/views/something', '/event/something', '/events/something'])(
		'Sub-route not found for %s',
		(url) => {
			it.each(NON_POST_METHODS)(
				'should return a certified not found response for %s',
				async (method) => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body: [],
						certificate_version: toNullable(2),
						headers: [],
						method,
						url
					};

					const response = await http_request(request);

					expect(
						response.headers.find(([key, _value]) => key.toLowerCase() === 'content-type')?.[1]
					).toEqual('application/json');

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					expect(JSON.parse(responseBody)).toEqual(RESPONSE_404);

					await assertCertification({
						canisterId,
						pic,
						request,
						response,
						currentDate,
						statusCode: 404
					});
				}
			);
		}
	);

	describe.each(['/view', '/views', '/event', '/events'])('Route not allowed for %s', (url) => {
		it.each(NON_POST_METHODS)(
			'should return a certified not allowed response for %s',
			async (method) => {
				const { http_request } = actor;

				const request: HttpRequest = {
					body: [],
					certificate_version: toNullable(2),
					headers: [],
					method,
					url
				};

				const response = await http_request(request);

				expect(
					response.headers.find(([key, _value]) => key.toLowerCase() === 'content-type')?.[1]
				).toEqual('application/json');

				const decoder = new TextDecoder();
				const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

				expect(JSON.parse(responseBody)).toEqual(RESPONSE_405);

				await assertCertification({
					canisterId,
					pic,
					request,
					response,
					currentDate,
					statusCode: 405
				});
			}
		);
	});
});
