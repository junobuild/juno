import type {
	AnalyticKey,
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
	satelliteIdMock,
	type SetTrackEventPayload,
	type TrackEventPayload,
	trackEventPayloadMock
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
		interface SetTrackEventRequest {
			key: AnalyticKey;
			track_event: SetTrackEventPayload;
		}

		const trackEvent: SetTrackEventRequest = {
			key: { key: nanoid(), collected_at: 1230n },
			track_event: trackEventPayloadMock
		};

		const trackEvents: SetTrackEventRequest[] = [
			{
				key: { key: nanoid(), collected_at: 1230n },
				track_event: trackEventPayloadMock
			},
			{
				key: { key: nanoid(), collected_at: 1240n },
				track_event: trackEventPayloadMock
			}
		];

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

			describe('track event', () => {
				const body = toBodyJson(trackEvent);

				it('should upgrade http_request', async () => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/event'
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
						url: '/event'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				it('should set a track event', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						ok: { data }
					}: { ok: { data: TrackEventPayload } } = JSON.parse(responseBody, jsonReviver);

					const { version, created_at, updated_at, ...rest } = data;

					const { user_agent: _, ...restMock } = trackEventPayloadMock;

					expect(rest).toEqual(restMock);
					expect(version).toEqual(1n);
					expect(created_at).toBeGreaterThan(0n);
					expect(updated_at).toBeGreaterThan(0n);
					expect(created_at).toEqual(updated_at);
				});

				it('should fail at updating track event without version', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_500_NO_VERSION_PROVIDED);
				});

				it('should update a track event', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson({
							...trackEvent,
							track_event: {
								...trackEvent.track_event,
								version: 1n
							}
						}),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						ok: { data }
					}: { ok: { data: TrackEventPayload } } = JSON.parse(responseBody, jsonReviver);

					const { version } = data;

					expect(version).toEqual(2n);
				});
			});

			describe('track events', () => {
				const body = toBodyJson(trackEvents);

				it('should upgrade http_request', async () => {
					const { http_request } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/events'
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
						url: '/events'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				it('should set track events', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_OK);
				});

				it('should fail at updating track events without version', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual({
						err: {
							code: 500,
							message: trackEvents
								.map(({ key }) => `${key.key}: juno.error.no_version_provided`)
								.join(', ')
						}
					});
				});

				it('should update track events', async () => {
					const { http_request_update } = actor;

					const request: HttpRequest = {
						body: toBodyJson(
							trackEvents.map((trackEvent) => ({
								...trackEvent,
								track_event: {
									...trackEvent.track_event,
									version: 1n
								}
							}))
						),
						certificate_version: toNullable(2),
						headers: [],
						method: 'POST',
						url: '/events'
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

			it('should retrieve all track events', async () => {
				const { get_track_events } = actor;

				const result = await get_track_events({
					from: [],
					to: [],
					satellite_id: [satelliteIdMock]
				});

				expect(Array.isArray(result)).toBe(true);

				expect(result.length).toEqual([trackEvent, ...trackEvents].length);

				result.forEach(([key, pageView]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1230n);
					expect(key.collected_at).toBeLessThanOrEqual(1240n);
					expect(pageView.name).toBe('my_event');
					expect(fromNullable(pageView.version)).toBe(2n);
				});
			});
		});
	});
});
