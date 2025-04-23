import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { HttpRequest } from '$declarations/satellite/satellite.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { jsonReplacer, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { pageViewMock, satelliteIdMock } from '../../mocks/orbiter.mocks';
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

	describe('configured', () => {
		beforeAll(async () => {
			actor.setIdentity(controller);

			const allFeatures: OrbiterSatelliteFeatures = {
				page_views: true,
				performance_metrics: true,
				track_events: true
			};

			const { set_satellite_configs } = actor;

			await set_satellite_configs([
				[
					satelliteIdMock,
					{
						version: [],
						features: [allFeatures]
					}
				]
			]);
		});

		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const key = nanoid();

			interface PageViewPayload {
				key: AnalyticKey;
				page_view: SetPageView;
			}

			const pagesViews: PageViewPayload[] = [
				{
					key: { key, collected_at: 123n },
					page_view: pageViewMock
				},
				{
					key: { key: nanoid(), collected_at: 123n },
					page_view: pageViewMock
				}
			];

			it('should upgrade http_request', async () => {
				const { http_request } = actor;

				console.log(JSON.stringify(pagesViews, jsonReplacer))

				const request: HttpRequest = {
					body: new TextEncoder().encode(JSON.stringify(pagesViews, jsonReplacer)),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/views'
				};

				const response = await http_request(request);

				console.log(response)
			});

			it('should set page views', async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: new TextEncoder().encode(JSON.stringify(pagesViews, jsonReplacer)),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/views'
				};

				const response = await http_request_update(request);

				const decoder = new TextDecoder();
				const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

				console.log(response, responseBody)
			});
		});
	});
});
