import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { HttpRequest } from '$declarations/satellite/satellite.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	pageViewPayloadMock,
	performanceMetricPayloadMock,
	satelliteIdMock,
	type SetPageViewRequest,
	type SetPageViewsRequest,
	type SetPerformanceRequest,
	type SetPerformancesRequest,
	type SetTrackEventRequest,
	type SetTrackEventsRequest,
	trackEventPayloadMock
} from '../../mocks/orbiter.mocks';
import { toBodyJson } from '../../utils/orbiter-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > HTTP > Bot', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const URLS = ['/view', '/views', '/event', '/events', '/metric', '/metrics'];

	const NON_POST_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

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

	describe.each([
		[
			'With User-Agent header bot',
			[
				['User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)']
			] as [string, string][],
			403
		],
		['Without User-Agent header', [], 400]
		// eslint-disable-next-line local-rules/prefer-object-params
	])('%s', (_, requestHeaders, expectedStatusCode) => {
		const assertRequestNotFound = async (request: HttpRequest) => {
			const { http_request_update } = actor;

			const response = await http_request_update(request);

			const { status_code } = response;

			expect(status_code).toEqual(expectedStatusCode);
		};

		describe('Page views', () => {
			const pageView: SetPageViewRequest = {
				satellite_id: satelliteIdMock.toText(),
				key: { key: nanoid(), collected_at: 1230n },
				page_view: pageViewPayloadMock
			};

			const pageViews: SetPageViewsRequest = {
				satellite_id: satelliteIdMock.toText(),
				page_views: [
					{
						key: { key: nanoid(), collected_at: 1230n },
						page_view: pageViewPayloadMock
					}
				]
			};

			it(`should return not found for POST to /views`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(pageView),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/view'
				};

				await assertRequestNotFound(request);
			});

			it(`should return not found for POST to /views`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(pageViews),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/views'
				};

				await assertRequestNotFound(request);
			});
		});

		describe('Track events', () => {
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
					}
				]
			};

			it(`should return not found for POST to /event`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(trackEvent),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/event'
				};

				await assertRequestNotFound(request);
			});

			it(`should return not found for POST to /events`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(trackEvents),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/events'
				};

				await assertRequestNotFound(request);
			});
		});

		describe('Performance metrics', () => {
			const performanceMetricEvent: SetPerformanceRequest = {
				satellite_id: satelliteIdMock.toText(),
				key: { key: nanoid(), collected_at: 1230n },
				performance_metric: performanceMetricPayloadMock
			};

			const performanceMetricEvents: SetPerformancesRequest = {
				satellite_id: satelliteIdMock.toText(),
				performance_metrics: [
					{
						key: { key: nanoid(), collected_at: 1230n },
						performance_metric: performanceMetricPayloadMock
					}
				]
			};

			it(`should return not found for POST to /metric`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(performanceMetricEvent),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/metric'
				};

				await assertRequestNotFound(request);
			});

			it(`should return not found for POST to /metrics`, async () => {
				const request: HttpRequest = {
					body: toBodyJson(performanceMetricEvents),
					certificate_version: toNullable(2),
					headers: requestHeaders,
					method: 'POST',
					url: '/metrics'
				};

				await assertRequestNotFound(request);
			});
		});
	});
});
