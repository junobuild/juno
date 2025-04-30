import type {
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { HttpRequest } from '$declarations/satellite/satellite.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, jsonReviver, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	type PageViewPayload,
	pageViewPayloadMock,
	satelliteIdMock,
	type SetPageViewRequest,
	type SetPageViewsRequest
} from '../../mocks/orbiter.mocks';
import { toBodyJson } from '../../utils/orbiter-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > HTTP > Page views', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const NON_POST_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

	const RESPONSE_OK = { ok: { data: null } };
	const RESPONSE_500_NO_VERSION_PROVIDED = {
		err: { code: 500, message: 'juno.error.no_version_provided' }
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		// Certified responses are initialized asynchronously
		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('With configuration', () => {
		const pageView: SetPageViewRequest = {
			satellite_id: satelliteIdMock.toText(),
			key: { key: nanoid(), collected_at: 1230n },
			page_view: pageViewPayloadMock
		};

		const pagesViews: SetPageViewsRequest = {
			satellite_id: satelliteIdMock.toText(),
			page_views: [
				{
					key: { key: nanoid(), collected_at: 1230n },
					page_view: pageViewPayloadMock
				},
				{
					key: { key: nanoid(), collected_at: 1240n },
					page_view: pageViewPayloadMock
				}
			]
		};

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
						restricted_origin: [],
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

			describe('page view', () => {
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

					expect(fromNullable(response.upgrade)).toBeTruthy();
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

				const invalidPayloads: [string, Record<string, unknown>][] = [
					['invalid payload', { ...pageView, key: 'invalid' }],
					['empty payload', { key: pageView.key, satellite_id: pageView.satellite_id }],
					['unknown satellite id', { ...pageView, satellite_id: 'nkzsw-gyaaa-aaaal-ada3a-cai' }]
				];

				it.each(invalidPayloads)(
					'should upgrade http_request for %s',
					// eslint-disable-next-line local-rules/prefer-object-params
					async (_title, payload) => {
						const { http_request } = actor;

						const request: HttpRequest = {
							body: toBodyJson(payload),
							certificate_version: toNullable(2),
							headers: [],
							method: 'POST',
							url: '/view'
						};

						const response = await http_request(request);

						expect(fromNullable(response.upgrade)).toBeTruthy();
					}
				);

				it('should return a bad request for invalid type', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson(invalidPayloads[0][1]),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(500);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('invalid type: string \"invalid\"')).toBeTruthy();
				});

				it('should return a bad request for missing field', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson(invalidPayloads[1][1]),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(500);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('missing field `page_view`')).toBeTruthy();
				});

				it('should return a bad request for unknown satellite', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson(invalidPayloads[2][1]),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(500);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message).toEqual('error_page_views_feature_disabled');
				});

				it('should not set a page view with invalid satellite id', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson({
							...pageView,
							satellite_id: satelliteIdMock // Should be principal as text
						}),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/view'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(500);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('invalid type')).toBeTruthy();
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

					expect(response.status_code).toEqual(200);

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

					expect(result).toEqual(RESPONSE_500_NO_VERSION_PROVIDED);
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

			describe('page views', () => {
				const body = toBodyJson(pagesViews);

				it('should upgrade http_request', async () => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it.each(NON_POST_METHODS)('should not upgrade http_request for %s', async (method) => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method,
						url: '/views'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				it.each([
					[
						'invalid payload',
						{
							...pagesViews,
							page_views: [
								{
									...pagesViews.page_views[0],
									key: 'invalid'
								}
							]
						}
					],
					['empty payload', { satellite_id: pagesViews.satellite_id, page_views: [] }],
					['unknown satellite id', { ...pagesViews, satellite_id: 'nkzsw-gyaaa-aaaal-ada3a-cai' }]
					// eslint-disable-next-line local-rules/prefer-object-params
				])('should upgrade http_request for %s', async (_title, payload) => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body: toBodyJson(payload),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it('should not set page views with invalid satellite id', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson({
							page_views: [
								{
									...pageView,
									...pageViewPayloadMock,
									satellite_id: satelliteIdMock // Should be principal as text
								}
							]
						}),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(500);
				});

				it('should set page views', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(200);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_OK);
				});

				it('should fail at updating page views without version', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual({
						err: {
							code: 500,
							message: pagesViews.page_views
								.map(({ key }) => `${key.key}: juno.error.no_version_provided`)
								.join(', ')
						}
					});
				});

				it('should update page views', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson({
							...pagesViews,
							page_views: pagesViews.page_views.map((pageView) => ({
								...pageView,
								page_view: {
									...pageView.page_view,
									version: 1n
								}
							}))
						}),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/views'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_OK);
				});
			});
		});

		describe('controller', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should retrieve all page views', async () => {
				const { get_page_views } = actor;

				const result = await get_page_views({
					from: [],
					to: [],
					satellite_id: [satelliteIdMock]
				});

				expect(Array.isArray(result)).toBeTruthy();

				expect(result).toHaveLength([pageView, ...pagesViews.page_views].length);

				result.forEach(([key, pageView]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1230n);
					expect(key.collected_at).toBeLessThanOrEqual(1240n);
					expect(pageView.href).toBe('https://test.com');
					expect(fromNullable(pageView.version)).toBe(2n);
				});
			});
		});
	});
});
