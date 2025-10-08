import { type OrbiterDid , idlFactoryOrbiter, type OrbiterActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, jsonReviver, toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	satelliteIdMock,
	type SetTrackEventRequest,
	type SetTrackEventsRequest,
	type TrackEventPayload,
	trackEventPayloadMock,
	userAgentHeadersMock
} from '../../mocks/orbiter.mocks';
import { toBodyJson } from '../../utils/orbiter-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > HTTP > Track events', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const NON_POST_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

	const RESPONSE_OK = { ok: { data: null } };

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactoryOrbiter,
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
		const trackEvent: SetTrackEventRequest = {
			satellite_id: satelliteIdMock.toText(),
			key: { key: nanoid(), collected_at: 1230n },
			track_event: trackEventPayloadMock
		};

		const trackEvents: SetTrackEventsRequest = {
			satellite_id: satelliteIdMock.toText(),
			track_events: [
				{
					key: { key: nanoid(), collected_at: 1230n },
					track_event: trackEventPayloadMock
				},
				{
					key: { key: nanoid(), collected_at: 1240n },
					track_event: trackEventPayloadMock
				}
			]
		};

		beforeAll(async () => {
			actor.setIdentity(controller);

			const allFeatures: OrbiterDid.OrbiterSatelliteFeatures = {
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

			describe('track event', () => {
				const body = toBodyJson(trackEvent);

				it('should upgrade http_request', async () => {
					const { http_request } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it.each(NON_POST_METHODS)('should not upgrade http_request for %s', async (method) => {
					const { http_request } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method,
						url: '/event'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				const invalidPayloads: [string, Record<string, unknown>][] = [
					['invalid payload', { ...trackEvent, key: 'invalid' }],
					['empty payload', { key: trackEvent.key, satellite_id: trackEvent.satellite_id }],
					['unknown satellite id', { ...trackEvent, satellite_id: 'nkzsw-gyaaa-aaaal-ada3a-cai' }]
				];

				// eslint-disable-next-line local-rules/prefer-object-params
				it.each(invalidPayloads)('should upgrade http_request for %s', async (_title, payload) => {
					const { http_request } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(payload),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it('should return a bad request for invalid type', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[0][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(400);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('invalid type: string "invalid"')).toBeTruthy();
				});

				it('should return a bad request for missing field', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[1][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(400);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('missing field `track_event`')).toBeTruthy();
				});

				it('should return forbidden for unknown satellite', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[2][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(403);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message).toEqual('error_track_events_feature_disabled');
				});

				it('should not set a track event with invalid satellite id', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson({
							...trackEvent,
							satellite_id: satelliteIdMock // Should be principal as text
						}),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(400);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('invalid type')).toBeTruthy();
				});

				it('should set a track event', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(200);

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

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/event'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual({ err: { code: 403, message: 'juno.error.no_version_provided' } });
				});

				it('should update a track event', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson({
							...trackEvent,
							track_event: {
								...trackEvent.track_event,
								version: 1n
							}
						}),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
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

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it.each(NON_POST_METHODS)('should not upgrade http_request for %s', async (method) => {
					const { http_request } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method,
						url: '/events'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeUndefined();
				});

				const invalidPayloads: [string, Record<string, unknown>][] = [
					[
						'invalid payload',
						{
							...trackEvents,
							track_events: [
								{
									...trackEvents.track_events[0],
									key: 'invalid'
								}
							]
						}
					],
					['empty payload', { satellite_id: trackEvents.satellite_id, track_events: [] }],
					['unknown satellite id', { ...trackEvents, satellite_id: 'nkzsw-gyaaa-aaaal-ada3a-cai' }]
				];

				// eslint-disable-next-line local-rules/prefer-object-params
				it.each(invalidPayloads)('should upgrade http_request for %s', async (_title, payload) => {
					const { http_request } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(payload),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request(request);

					expect(fromNullable(response.upgrade)).toBeTruthy();
				});

				it('should return a bad request for invalid type', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[0][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(400);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('invalid type: string "invalid"')).toBeTruthy();
				});

				it('should return ok for empty payload', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[1][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(200);
				});

				it('should return forbidden for unknown satellite', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson(invalidPayloads[2][1]),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(403);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const {
						err: { message }
					}: { err: { message: string } } = JSON.parse(responseBody, jsonReviver);

					expect(message.includes('error_track_events_feature_disabled')).toBeTruthy();
				});

				it('should not set track events with invalid satellite id', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson({
							track_events: [
								{
									...trackEvent,
									...trackEventPayloadMock,
									satellite_id: satelliteIdMock // Should be principal as text
								}
							]
						}),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(400);
				});

				it('should set track events', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					expect(response.status_code).toEqual(200);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual(RESPONSE_OK);
				});

				it('should fail at updating track events without version', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body,
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
						method: 'POST',
						url: '/events'
					};

					const response = await http_request_update(request);

					const decoder = new TextDecoder();
					const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

					const result = JSON.parse(responseBody, jsonReviver);

					expect(result).toEqual({
						err: {
							code: 403,
							message: trackEvents.track_events
								.map(({ key }) => `${key.key}: juno.error.no_version_provided`)
								.join(', ')
						}
					});
				});

				it('should update track events', async () => {
					const { http_request_update } = actor;

					const request: OrbiterDid.HttpRequest = {
						body: toBodyJson({
							...trackEvents,
							track_events: trackEvents.track_events.map((trackEvent) => ({
								...trackEvent,
								track_event: {
									...trackEvent.track_event,
									version: 1n
								}
							}))
						}),
						certificate_version: toNullable(2),
						headers: userAgentHeadersMock,
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

				expect(Array.isArray(result)).toBeTruthy();

				expect(result).toHaveLength([trackEvent, ...trackEvents.track_events].length);

				result.forEach(([key, trackEvent]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1230n);
					expect(key.collected_at).toBeLessThanOrEqual(1240n);
					expect(trackEvent.name).toBe('my_event');
					expect(fromNullable(trackEvent.version)).toBe(2n);
				});
			});
		});
	});
});
