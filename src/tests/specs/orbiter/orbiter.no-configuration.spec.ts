import { type OrbiterDid , idlFactoryOrbiter, type OrbiterActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import {
	pageViewMock,
	performanceMetricMock,
	satelliteIdMock,
	trackEventMock
} from '../../mocks/orbiter.mocks';
import { ORBITER_WASM_PATH, controllersInitArgs } from '../../utils/setup-tests.utils';

describe('Orbiter > No configuration', () => {
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

	describe.each([
		{ features: [] },
		{
			features: [
				{
					page_views: false,
					performance_metrics: false,
					track_events: false
				}
			]
		}
	])('Feature is disabled', ({ features }) => {
		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_satellite_configs, list_satellite_configs } = actor;

			const config = (await list_satellite_configs()).find(
				([id, _]) => id.toText() === satelliteIdMock.toText()
			);

			await set_satellite_configs([
				[
					satelliteIdMock,
					{
						version: config?.[1].version ?? [],
						restricted_origin: [],
						features: features as [] | [OrbiterDid.OrbiterSatelliteFeatures]
					}
				]
			]);
		});

		it('should not set page views', async () => {
			const { set_page_views } = actor;

			const pagesViews: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][] = [
				[{ key: nanoid(), collected_at: 123n }, pageViewMock],
				[{ key: nanoid(), collected_at: 123n }, pageViewMock]
			];

			const results = await set_page_views(pagesViews);

			expect('Err' in results).toBeTruthy();

			(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
				expect(msg).toEqual('error_page_views_feature_disabled')
			);
		});

		it('should not set track events', async () => {
			const { set_track_events } = actor;

			const trackEvents: [OrbiterDid.AnalyticKey, OrbiterDid.SetTrackEvent][] = [
				[{ key: nanoid(), collected_at: 123n }, trackEventMock],
				[{ key: nanoid(), collected_at: 123n }, trackEventMock]
			];

			const results = await set_track_events(trackEvents);

			expect('Err' in results).toBeTruthy();

			(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
				expect(msg).toEqual('error_track_events_feature_disabled')
			);
		});

		it('should not set performance metrics', async () => {
			const { set_performance_metrics } = actor;

			const performanceMetrics: [OrbiterDid.AnalyticKey, OrbiterDid.SetPerformanceMetric][] = [
				[{ key: nanoid(), collected_at: 123n }, performanceMetricMock],
				[{ key: nanoid(), collected_at: 123n }, performanceMetricMock]
			];

			const results = await set_performance_metrics(performanceMetrics);

			expect('Err' in results).toBeTruthy();

			(results as { Err: Array<[OrbiterDid.AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
				expect(msg).toEqual('error_performance_metrics_feature_disabled')
			);
		});
	});
});
