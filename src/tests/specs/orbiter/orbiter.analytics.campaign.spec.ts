import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	PageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { jsonReviver } from '@dfinity/utils';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inject } from 'vitest';
import { satelliteIdMock } from '../../mocks/orbiter.mocks';
import { initOrbiterConfig, uploadPageViews } from '../../utils/orbiter-page-views-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > Analytics > Campaign', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	let pageViewsMock: [AnalyticKey, PageView][];

	const collected_at = 1742076010671000000n;

	const initMock = async () => {
		const content = await readFile(
			join(process.cwd(), 'src', 'tests/mocks/analytics.campaign.mocks.json'),
			'utf-8'
		);
		pageViewsMock = JSON.parse(content, jsonReviver);
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

		await initOrbiterConfig(actor);

		await initMock();

		await uploadPageViews({ pic, actor, collected_at, pageViewsMock });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should get the top10 campaigns', async () => {
		const { get_page_views_analytics_top_10 } = actor;

		const result = await get_page_views_analytics_top_10({
			satellite_id: [satelliteIdMock],
			from: [collected_at],
			to: [collected_at + 1000n]
		});

		expect(result).toEqual({
			referrers: [
				['source.com', 5],
				['demo.com', 3],
				['com.twitter.android', 2]
			],
			pages: [
				['/', 7],
				['/hello/', 5],
				['/info/', 1]
			],
			time_zones: [
				[
					['America/Los_Angeles', 5],
					['America/Chicago', 4],
					['Asia/Tokyo', 3],
					['Europe/Berlin', 1]
				]
			],
			utm_campaigns: [
				[
					['spring_sale', 5],
					['product_launch', 4],
					['b2b_outreach', 3],
					['partner_promo', 1]
				]
			],
			utm_sources: [
				[
					['google', 5],
					['linkedin', 4],
					['twitter', 3],
					['referral', 1]
				]
			]
		});
	});
});
