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

describe('Orbiter', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

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

	describe('Route not found', () => {
		it('should return a certified not found response', async () => {
			const { http_request } = actor;

			// TODO: tests methodes
			// TODO: tests various routes including root /

			const request: HttpRequest = {
				body: [],
				certificate_version: toNullable(2),
				headers: [],
				method: 'POST',
				url: '/something'
			};

			const response = await http_request(request);

			expect(
				response.headers.find(([key, _value]) => key.toLowerCase() === 'content-type')?.[1]
			).toEqual('application/json');

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

			expect(JSON.parse(responseBody)).toEqual({ err: { code: 404, message: 'Not found' } });

			await assertCertification({
				canisterId,
				pic,
				request,
				response,
				currentDate,
				statusCode: 404
			});
		});
	});
});
