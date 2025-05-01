import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures,
	PageView,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { jsonReviver } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inject } from 'vitest';
import { satelliteIdMock } from '../../mocks/orbiter.mocks';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > Analytics', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	let pageViewsMock: [AnalyticKey, PageView][];

	const initMock = async () => {
		const content = await readFile(
			join(process.cwd(), 'src', 'tests/mocks/orbiter.mocks.json'),
			'utf-8'
		);
		pageViewsMock = JSON.parse(content, jsonReviver);
	};

	const initConfig = async () => {
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
	};

	const uploadPageViews = async ({ collected_at }: { collected_at: bigint }) => {
		const setPageViewsData = pageViewsMock.map<[AnalyticKey, SetPageView]>(
			([key, { version: ___, created_at: _, updated_at: __, satellite_id, device, ...value }]) => [
				{
					...key,
					collected_at
				},
				{
					...value,
					updated_at: [],
					version: [],
					client: [],
					satellite_id: satelliteIdMock,
					device: {
						...device,
						screen_width: [],
						screen_height: []
					}
				}
			]
		);

		const it = setPageViewsData.values();
		const chunks: [AnalyticKey, SetPageView][][] = Array.from(it, (val) => [
			val,
			...it.take(50 - 1)
		]);

		const { set_page_views } = actor;

		for (const chunk of chunks) {
			await set_page_views(chunk);

			await tick(pic);
		}
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);

		await initConfig();

		await initMock();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Analytics with fallback', () => {
		const collected_at = 1742076030479000000n;

		beforeAll(async () => {
			await uploadPageViews({ collected_at });
		});

		it('should get page views metrics', async () => {
			const { get_page_views_analytics_metrics } = actor;

			const result = await get_page_views_analytics_metrics({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			const totalPageViews = pageViewsMock.length;
			const uniqueSessions = [...new Set(pageViewsMock.map(([_, { session_id }]) => session_id))]
				.length;

			let sessionsUniqueViews: Record<string, Set<string>> = {};
			let sessionsViews: Record<string, number> = {};

			for (const [_, { session_id, href }] of pageViewsMock) {
				const updatedSet = sessionsUniqueViews[session_id] ?? new Set();
				updatedSet.add(href);

				sessionsUniqueViews = {
					...sessionsUniqueViews,
					[session_id]: updatedSet
				};

				sessionsViews = {
					...sessionsViews,
					[session_id]: (sessionsViews[session_id] ?? 0) + 1
				};
			}

			const singlePageViewSessions = Object.values(sessionsViews).filter(
				(value) => value === 1
			).length;
			const bounceRate =
				Object.keys(sessionsViews).length > 0
					? singlePageViewSessions / Object.keys(sessionsViews).length
					: 0;

			const uniquePageViews = Object.values(sessionsUniqueViews).reduce((acc, value) => {
				return acc + value.size;
			}, 0);

			// In this test all page views are collected the same day so for simplicity reasons its the same value.
			const dailyTotalPageViews = totalPageViews;
			const averagePageViewsPerSession = dailyTotalPageViews / uniqueSessions;

			expect(result).toEqual({
				total_sessions: 70n,
				bounce_rate: bounceRate,
				average_page_views_per_session: averagePageViewsPerSession,
				daily_total_page_views: [
					[
						{
							day: 15,
							month: 3,
							year: 2025
						},
						dailyTotalPageViews
					]
				],
				total_page_views: totalPageViews,
				unique_page_views: BigInt(uniquePageViews),
				unique_sessions: BigInt(uniqueSessions)
			});
		});
	});
});
