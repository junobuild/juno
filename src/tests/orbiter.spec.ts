import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView,
	SetPerformanceMetric,
	SetTrackEvent
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	INVALID_VERSION_ERROR_MSG,
	NO_VERSION_ERROR_MSG
} from './constants/satellite-tests.constants';
import {
	pageViewMock,
	performanceMetricMock,
	satelliteIdMock,
	trackEventMock
} from './mocks/orbiter.mocks';
import { ORBITER_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Orbiter', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('not configured', () => {
		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			it('should not set page views if feature not enabled', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key: nanoid(), collected_at: 123n }, pageViewMock],
					[{ key: nanoid(), collected_at: 123n }, pageViewMock]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual('error_feature_not_enabled')
				);
			});

			it('should not set page views if feature not enabled', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key: nanoid(), collected_at: 123n }, trackEventMock],
					[{ key: nanoid(), collected_at: 123n }, trackEventMock]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual('error_feature_not_enabled')
				);
			});
		});
	});

	describe('configured', () => {
		describe('controller', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should configure satellite', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [],
								enabled: true
							}
						]
					])
				).resolves.not.toThrowError();
			});

			it('should not configure satellite if no version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [],
								enabled: true
							}
						]
					])
				).rejects.toThrow(NO_VERSION_ERROR_MSG);
			});

			it('should not configure satellite if invalid version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [123n],
								enabled: true
							}
						]
					])
				).rejects.toThrowError(new RegExp(INVALID_VERSION_ERROR_MSG, 'i'));
			});
		});

		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const key = nanoid();

			it('should set page views', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key, collected_at: 123n }, pageViewMock],
					[{ key: nanoid(), collected_at: 123n }, pageViewMock]
				];

				await expect(set_page_views(pagesViews)).resolves.not.toThrowError();
			});

			it('should not set page views if no version', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key, collected_at: 123n }, pageViewMock]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_VERSION_ERROR_MSG)
				);
			});

			it('should not set page views if invalid version', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[
						{ key, collected_at: 123n },
						{
							...pageViewMock,
							version: [123n]
						}
					]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_VERSION_ERROR_MSG)
				);
			});

			it('should set track events', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEventMock],
					[{ key: nanoid(), collected_at: 123n }, trackEventMock]
				];

				await expect(set_track_events(trackEvents)).resolves.not.toThrowError();
			});

			it('should not set track events if no version', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEventMock]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_VERSION_ERROR_MSG)
				);
			});

			it('should not set track events if invalid version', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[
						{ key, collected_at: 123n },
						{
							...trackEventMock,
							version: [123n]
						}
					]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_VERSION_ERROR_MSG)
				);
			});

			it('should set performance metrics', async () => {
				const { set_performance_metrics } = actor;

				const performanceMetrics: [AnalyticKey, SetPerformanceMetric][] = [
					[{ key, collected_at: 123n }, performanceMetricMock],
					[{ key: nanoid(), collected_at: 123n }, performanceMetricMock]
				];

				await expect(set_performance_metrics(performanceMetrics)).resolves.not.toThrowError();
			});

			it('should not set performance metrics if no version', async () => {
				const { set_performance_metrics } = actor;

				const performanceMetrics: [AnalyticKey, SetPerformanceMetric][] = [
					[{ key, collected_at: 123n }, performanceMetricMock]
				];

				const results = await set_performance_metrics(performanceMetrics);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_VERSION_ERROR_MSG)
				);
			});

			it('should not set performance metrics if invalid version', async () => {
				const { set_performance_metrics } = actor;

				const performanceMetrics: [AnalyticKey, SetPerformanceMetric][] = [
					[
						{ key, collected_at: 123n },
						{
							...performanceMetricMock,
							version: [123n] // Assuming an invalid version format for testing
						}
					]
				];

				const results = await set_performance_metrics(performanceMetrics);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_VERSION_ERROR_MSG)
				);
			});

			it('should throw on retrieve page views if not controller', async () => {
				const { get_page_views } = actor;

				await expect(
					get_page_views({
						from: [100n],
						to: [500n],
						satellite_id: [satelliteIdMock]
					})
				).rejects.toThrow('Caller is not a controller of the orbiter.');
			});

			it('should throw on retrieve track events if not controller', async () => {
				const { get_track_events } = actor;

				await expect(
					get_track_events({
						from: [100n],
						to: [500n],
						satellite_id: [satelliteIdMock]
					})
				).rejects.toThrow('Caller is not a controller of the orbiter.');
			});

			it('should throw on retrieve performance metrics if not controller', async () => {
				const { get_performance_metrics } = actor;

				await expect(
					get_performance_metrics({
						from: [100n],
						to: [500n],
						satellite_id: [satelliteIdMock]
					})
				).rejects.toThrow('Caller is not a controller of the orbiter.');
			});
		});

		describe('controller read', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should retrieve page views', async () => {
				const { set_page_views, get_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key: nanoid(), collected_at: 1230n }, pageViewMock],
					[{ key: nanoid(), collected_at: 4560n }, pageViewMock]
				];

				await set_page_views(pagesViews);

				const result = await get_page_views({
					from: [1000n],
					to: [5000n],
					satellite_id: [satelliteIdMock]
				});

				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toEqual(pagesViews.length);
				result.forEach(([key, pageView]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
					expect(key.collected_at).toBeLessThanOrEqual(5000n);
					expect(pageView.href).toBe('https://test.com');
					expect(fromNullable(pageView.version)).toBe(1n);
				});
			});

			it('should retrieve track events', async () => {
				const { set_track_events, get_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key: nanoid(), collected_at: 1230n }, trackEventMock],
					[{ key: nanoid(), collected_at: 4560n }, trackEventMock]
				];

				await set_track_events(trackEvents);

				const result = await get_track_events({
					from: [1000n],
					to: [5000n],
					satellite_id: [satelliteIdMock]
				});

				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toEqual(trackEvents.length);
				result.forEach(([key, trackEvent]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
					expect(key.collected_at).toBeLessThanOrEqual(5000n);
					expect(trackEvent.name).toBe('my_event');
					expect(fromNullable(trackEvent.version)).toBe(1n);
				});
			});

			it('should retrieve performance metrics', async () => {
				const { set_performance_metrics, get_performance_metrics } = actor;

				const performanceMetrics: [AnalyticKey, SetPerformanceMetric][] = [
					[{ key: nanoid(), collected_at: 1230n }, performanceMetricMock],
					[{ key: nanoid(), collected_at: 4560n }, performanceMetricMock]
				];

				await set_performance_metrics(performanceMetrics);

				const result = await get_performance_metrics({
					from: [1000n],
					to: [5000n],
					satellite_id: [satelliteIdMock]
				});

				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBeGreaterThan(0);
				result.forEach(([key, performanceMetric]) => {
					expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
					expect(key.collected_at).toBeLessThanOrEqual(5000n);
					expect(performanceMetric.metric_name).toEqual({ LCP: null });
					expect(fromNullable(performanceMetric.version)).toBe(1n);
				});
			});
		});
	});
});
