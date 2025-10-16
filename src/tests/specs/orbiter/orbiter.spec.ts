import { type OrbiterActor, type OrbiterDid, idlFactoryOrbiter } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import {
	JUNO_ERROR_NO_VERSION_PROVIDED,
	JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE
} from '@junobuild/errors';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	pageViewMock,
	performanceMetricMock,
	satelliteIdMock,
	trackEventMock
} from '../../mocks/orbiter.mocks';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactoryOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('configured', () => {
		describe('controller', () => {
			const allFeatures: OrbiterDid.OrbiterSatelliteFeatures = {
				page_views: true,
				performance_metrics: true,
				track_events: true
			};

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
								restricted_origin: [],
								features: [allFeatures]
							}
						]
					])
				).resolves.not.toThrow();
			});

			it('should not configure satellite if no version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [],
								restricted_origin: [],
								features: [allFeatures]
							}
						]
					])
				).rejects.toThrow(JUNO_ERROR_NO_VERSION_PROVIDED);
			});

			it('should not configure satellite if invalid version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [123n],
								restricted_origin: [],
								features: [allFeatures]
							}
						]
					])
				).rejects.toThrow(new RegExp(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE, 'i'));
			});
		});

		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const key = nanoid();

			it('should throw on set page view', async () => {
				const { set_page_view } = actor;

				await expect(set_page_view({ key, collected_at: 123n }, pageViewMock)).rejects.toThrow(
					'Caller is not a controller of the orbiter.'
				);
			});

			it('should throw on set page views', async () => {
				const { set_page_views } = actor;

				const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
					[{ key, collected_at: 123n }, pageViewMock],
					[{ key: nanoid(), collected_at: 123n }, pageViewMock]
				];

				await expect(set_page_views(pagesViews)).rejects.toThrow(
					'Caller is not a controller of the orbiter.'
				);
			});

			it('should throw on set track event', async () => {
				const { set_track_event } = actor;

				await expect(set_track_event({ key, collected_at: 123n }, trackEventMock)).rejects.toThrow(
					'Caller is not a controller of the orbiter.'
				);
			});

			it('should throw on set track events', async () => {
				const { set_track_events } = actor;

				const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEventMock],
					[{ key: nanoid(), collected_at: 123n }, trackEventMock]
				];

				await expect(set_track_events(trackEvents)).rejects.toThrow(
					'Caller is not a controller of the orbiter.'
				);
			});

			it('should throw on set performance metric', async () => {
				const { set_performance_metric } = actor;

				await expect(
					set_performance_metric({ key, collected_at: 123n }, performanceMetricMock)
				).rejects.toThrow('Caller is not a controller of the orbiter.');
			});

			it('should throw on set performance metrics', async () => {
				const { set_performance_metrics } = actor;

				const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] = [
					[{ key, collected_at: 123n }, performanceMetricMock],
					[{ key: nanoid(), collected_at: 123n }, performanceMetricMock]
				];

				await expect(set_performance_metrics(performanceMetrics)).rejects.toThrow(
					'Caller is not a controller of the orbiter.'
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

			it('should throw on memory size', async () => {
				const { memory_size } = actor;

				await expect(memory_size()).rejects.toThrow('Caller is not a controller of the orbiter.');
			});
		});

		describe('For controller', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should return size', async () => {
				const { memory_size } = actor;

				const size = await memory_size();

				expect(size).toEqual({
					heap: 3866624n,
					stable: 50397184n
				});
			});

			describe('write', () => {
				const key = nanoid();

				it('should set page view', async () => {
					const { set_page_view } = actor;

					await expect(
						set_page_view({ key: nanoid(), collected_at: 123567890n }, pageViewMock)
					).resolves.not.toThrow();
				});

				it('should set page views', async () => {
					const { set_page_views } = actor;

					const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
						[{ key, collected_at: 123n }, pageViewMock],
						[{ key: nanoid(), collected_at: 123n }, pageViewMock]
					];

					await expect(set_page_views(pagesViews)).resolves.not.toThrow();
				});

				it('should not set page views if no version', async () => {
					const { set_page_views } = actor;

					const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
						[{ key, collected_at: 123n }, pageViewMock]
					];

					const results = await set_page_views(pagesViews);

					expect('Err' in results).toBeTruthy();

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toEqual(JUNO_ERROR_NO_VERSION_PROVIDED)
					);
				});

				it('should not set page views if invalid version', async () => {
					const { set_page_views } = actor;

					const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
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

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toContain(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE)
					);
				});

				it('should set track event', async () => {
					const { set_track_event } = actor;

					await expect(
						set_track_event({ key, collected_at: 1234567890n }, trackEventMock)
					).resolves.not.toThrow();
				});

				it('should set track events', async () => {
					const { set_track_events } = actor;

					const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
						[{ key, collected_at: 123n }, trackEventMock],
						[{ key: nanoid(), collected_at: 123n }, trackEventMock]
					];

					await expect(set_track_events(trackEvents)).resolves.not.toThrow();
				});

				it('should not set track events if no version', async () => {
					const { set_track_events } = actor;

					const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
						[{ key, collected_at: 123n }, trackEventMock]
					];

					const results = await set_track_events(trackEvents);

					expect('Err' in results).toBeTruthy();

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toEqual(JUNO_ERROR_NO_VERSION_PROVIDED)
					);
				});

				it('should not set track events if invalid version', async () => {
					const { set_track_events } = actor;

					const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
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

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toContain(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE)
					);
				});

				it('should set performance metric', async () => {
					const { set_performance_metric } = actor;

					await expect(
						set_performance_metric({ key, collected_at: 1234567890n }, performanceMetricMock)
					).resolves.not.toThrow();
				});

				it('should set performance metrics', async () => {
					const { set_performance_metrics } = actor;

					const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] = [
						[{ key, collected_at: 123n }, performanceMetricMock],
						[{ key: nanoid(), collected_at: 123n }, performanceMetricMock]
					];

					await expect(set_performance_metrics(performanceMetrics)).resolves.not.toThrow();
				});

				it('should not set performance metrics if no version', async () => {
					const { set_performance_metrics } = actor;

					const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] = [
						[{ key, collected_at: 123n }, performanceMetricMock]
					];

					const results = await set_performance_metrics(performanceMetrics);

					expect('Err' in results).toBeTruthy();

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toEqual(JUNO_ERROR_NO_VERSION_PROVIDED)
					);
				});

				it('should not set performance metrics if invalid version', async () => {
					const { set_performance_metrics } = actor;

					const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] = [
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

					(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
						expect(msg).toContain(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE)
					);
				});
			});

			describe('read', () => {
				describe('list', () => {
					it('should retrieve page views', async () => {
						const { set_page_views, get_page_views } = actor;

						const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
							[{ key: nanoid(), collected_at: 1230n }, pageViewMock],
							[{ key: nanoid(), collected_at: 4560n }, pageViewMock]
						];

						await set_page_views(pagesViews);

						const result = await get_page_views({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(Array.isArray(result)).toBeTruthy();
						expect(result).toHaveLength(pagesViews.length);

						result.forEach(([key, pageView]) => {
							expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
							expect(key.collected_at).toBeLessThanOrEqual(5000n);
							expect(pageView.href).toBe('https://test.com');
							expect(fromNullable(pageView.version)).toBe(1n);
						});
					});

					it('should retrieve track events', async () => {
						const { set_track_events, get_track_events } = actor;

						const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
							[{ key: nanoid(), collected_at: 1230n }, trackEventMock],
							[{ key: nanoid(), collected_at: 4560n }, trackEventMock]
						];

						await set_track_events(trackEvents);

						const result = await get_track_events({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(Array.isArray(result)).toBeTruthy();
						expect(result).toHaveLength(trackEvents.length);

						result.forEach(([key, trackEvent]) => {
							expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
							expect(key.collected_at).toBeLessThanOrEqual(5000n);
							expect(trackEvent.name).toBe('my_event');
							expect(fromNullable(trackEvent.version)).toBe(1n);
						});
					});

					it('should retrieve performance metrics', async () => {
						const { set_performance_metrics, get_performance_metrics } = actor;

						const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] =
							[
								[{ key: nanoid(), collected_at: 1230n }, performanceMetricMock],
								[{ key: nanoid(), collected_at: 4560n }, performanceMetricMock]
							];

						await set_performance_metrics(performanceMetrics);

						const result = await get_performance_metrics({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(Array.isArray(result)).toBeTruthy();
						expect(result.length).toBeGreaterThan(0);

						result.forEach(([key, performanceMetric]) => {
							expect(key.collected_at).toBeGreaterThanOrEqual(1000n);
							expect(key.collected_at).toBeLessThanOrEqual(5000n);
							expect(performanceMetric.metric_name).toEqual({ LCP: null });
							expect(fromNullable(performanceMetric.version)).toBe(1n);
						});
					});
				});

				describe('aggregate', () => {
					it('should retrieve page views analytics clients', async () => {
						const { get_page_views_analytics_clients } = actor;

						const result = await get_page_views_analytics_clients({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(result).toHaveProperty('browsers');
						expect(result.browsers).toHaveProperty('chrome');
						expect(result.browsers).toHaveProperty('safari');
						expect(result.browsers).toHaveProperty('firefox');
						expect(result.browsers).toHaveProperty('opera');
						expect(result.browsers).toHaveProperty('others');

						expect(result).toHaveProperty('devices');
						expect(result.devices).toHaveProperty('desktop');
						expect(result.devices).toHaveProperty('mobile');
						expect(result.devices).toHaveProperty('laptop');

						expect(result.browsers.firefox).toEqual(1);
						expect(result.devices.desktop).toEqual(1);
					});

					it('should retrieve page views analytics metrics', async () => {
						const { get_page_views_analytics_metrics } = actor;

						const result = await get_page_views_analytics_metrics({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(result).toHaveProperty('bounce_rate');
						expect(result).toHaveProperty('average_page_views_per_session');
						expect(result).toHaveProperty('daily_total_page_views');
						expect(result).toHaveProperty('total_page_views');
						expect(result).toHaveProperty('unique_page_views');
						expect(result).toHaveProperty('unique_sessions');

						expect(result.average_page_views_per_session).toEqual(2);
						expect(result.total_page_views).toEqual(2);
						expect(result.unique_page_views).toEqual(1n);
						expect(result.unique_sessions).toEqual(1n);
					});

					it('should retrieve page views analytics top 10', async () => {
						const { get_page_views_analytics_top_10 } = actor;

						const result = await get_page_views_analytics_top_10({
							from: [1000n],
							to: [5000n],
							satellite_id: [satelliteIdMock]
						});

						expect(result).toHaveProperty('referrers');
						expect(result.referrers).toBeInstanceOf(Array);
						expect(result.referrers.length).toBeLessThanOrEqual(10);

						expect(result).toHaveProperty('pages');
						expect(result.pages).toBeInstanceOf(Array);
						expect(result.pages.length).toBeLessThanOrEqual(10);

						expect(result.pages.find((page) => page[0] === '/')?.[1]).toEqual(2);
					});
				});

				it('should retrieve performance metrics analytics web vitals', async () => {
					const { get_performance_metrics_analytics_web_vitals } = actor;

					const result = await get_performance_metrics_analytics_web_vitals({
						from: [1000n],
						to: [5000n],
						satellite_id: [satelliteIdMock]
					});

					expect(result).toHaveProperty('overall');
					expect(result.overall).toHaveProperty('cls');
					expect(result.overall).toHaveProperty('fcp');
					expect(result.overall).toHaveProperty('inp');
					expect(result.overall).toHaveProperty('lcp');
					expect(result.overall).toHaveProperty('ttfb');

					expect(result).toHaveProperty('pages');
					expect(result.pages).toBeInstanceOf(Array);
					expect(result.pages.length).toBeGreaterThan(0);

					expect(fromNullable(result.overall.lcp)).toEqual(1.23);
				});

				it('should retrieve track events analytics', async () => {
					const { get_track_events_analytics } = actor;

					const result = await get_track_events_analytics({
						from: [1000n],
						to: [5000n],
						satellite_id: [satelliteIdMock]
					});

					expect(result).toHaveProperty('total');
					expect(result.total).toBeInstanceOf(Array);
					expect(result.total.length).toBeGreaterThan(0);

					expect(result.total.find((entry) => entry[0] === 'my_event')?.[1]).toEqual(2);
				});
			});
		});
	});
});
