import type {
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures
} from '$declarations/orbiter/orbiter.did';
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
import { assertCertification } from '../../utils/certification-test.utils';
import { toBodyJson } from '../../utils/orbiter-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > HTTP > CORS', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const URLS = ['/view', '/views', '/event', '/events', '/metric', '/metrics'];

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

	const assertCORS = (allowedOriginForPOST = '*') => {
		it.each(URLS)('should return * for OPTIONS to %s', async (url) => {
			const { http_request } = actor;

			const request: HttpRequest = {
				body: [],
				certificate_version: toNullable(2),
				headers: [],
				method: 'OPTIONS',
				url
			};

			const response = await http_request(request);

			const { status_code, headers: reponseHeaders } = response;

			expect(status_code).toEqual(204);

			const headers = reponseHeaders.reduce<Record<string, string>>(
				(acc, [key, value]) => ({ ...acc, [`${key}`]: value }),
				{}
			);

			expect(headers['Access-Control-Allow-Origin']).toEqual('*');
			expect(headers['Access-Control-Allow-Methods']).toEqual('POST, OPTIONS');
			expect(headers['Access-Control-Allow-Headers']).toEqual('Content-Type');

			await assertCertification({
				canisterId,
				pic,
				request,
				response,
				currentDate,
				statusCode: 204
			});
		});

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

			it(`should return ${allowedOriginForPOST} for POST to /views`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(pageView),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/view'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
			});

			it(`should return ${allowedOriginForPOST} for POST to /views`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(pageViews),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/views'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
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

			it(`should return ${allowedOriginForPOST} for POST to /event`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(trackEvent),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/event'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
			});

			it(`should return ${allowedOriginForPOST} for POST to /events`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(trackEvents),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/events'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
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

			it(`should return ${allowedOriginForPOST} for POST to /metric`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(performanceMetricEvent),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/metric'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
			});

			it(`should return ${allowedOriginForPOST} for POST to /metrics`, async () => {
				const { http_request_update } = actor;

				const request: HttpRequest = {
					body: toBodyJson(performanceMetricEvents),
					certificate_version: toNullable(2),
					headers: [],
					method: 'POST',
					url: '/metrics'
				};

				const response = await http_request_update(request);

				const { status_code, headers } = response;

				expect(status_code).toEqual(200);

				expect(headers.find(([key, _]) => key === 'Access-Control-Allow-Origin')?.[1]).toEqual(
					allowedOriginForPOST
				);
			});
		});
	};

	describe('Without restricted domain configuration', () => {
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

		assertCORS();
	});

	describe('With restricted domain configuration', () => {
		const restrictedDomain = 'https://mydomain.com';

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
						version: [1n],
						restricted_origin: [restrictedDomain],
						features: [allFeatures]
					}
				]
			]);
		});

		assertCORS(restrictedDomain);
	});
});
