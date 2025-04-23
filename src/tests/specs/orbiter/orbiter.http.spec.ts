import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { HttpRequest } from '$declarations/satellite/satellite.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, jsonReplacer, jsonReviver, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	type PageViewPayload,
	pageViewPayloadMock,
	satelliteIdMock,
	type SetPageViewPayload
} from '../../mocks/orbiter.mocks';
import { assertCertification } from '../../utils/certification-test.utils';
import { toBodyJson } from '../../utils/orbiter-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const NON_POST_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

	const RESPONSE_OK = { ok: { data: null } };
	const RESPONSE_404 = { err: { code: 404, message: 'Not found' } };
	const RESPONSE_500 = { err: { code: 500, message: 'juno.error.no_version_provided' } };

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

			expect(JSON.parse(responseBody)).toEqual(RESPONSE_404);

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

			interface SetPageViewRequest {
				key: AnalyticKey;
				page_view: SetPageViewPayload;
			}

			describe('page view', () => {
				const pageView: SetPageViewRequest = {
					key: { key: nanoid(), collected_at: 123n },
					page_view: pageViewPayloadMock
				};

				const body = toBodyJson(pageView);

				it('should upgrade http_request', async () => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toEqual(true);
				});

				it.each(NON_POST_METHODS)('should not upgrade http_request for %s', async (method) => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method,
						url: '/view'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				it('should set a page view', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						ok: { data }
					}: { ok: { data: PageViewPayload } } = JSON.parse(responseBody, jsonReviver);

					const { version, created_at, updated_at, ...rest } = data;

					expect(rest).toEqual(pageViewPayloadMock);
					expect(version).toEqual(1n);
					expect(created_at).toBeGreaterThan(0n);
					expect(updated_at).toBeGreaterThan(0n);
					expect(created_at).toEqual(updated_at);
				});

				it('should fail at updating page view without version', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_500);
				});

				it('should update a page view', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson({
							...pageView,
							page_view: {
								...pageView.page_view,
								version: 1n
							}
						}),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						ok: { data }
					}: { ok: { data: PageViewPayload } } = JSON.parse(responseBody, jsonReviver);

					const { version } = data;

					expect(version).toEqual(2n);
				});
			});

			const pagesViews: SetPageViewRequest[] = [
				{
					key: { key, collected_at: 123n },
					page_view: pageViewPayloadMock
				},
				{
					key: { key: nanoid(), collected_at: 123n },
					page_view: pageViewPayloadMock
				}
			];

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

				console.log(response, responseBody);
			});
		});
	});
});
