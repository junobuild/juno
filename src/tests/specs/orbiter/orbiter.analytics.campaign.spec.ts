import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	PageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { jsonReviver } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
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
			pages: [
				['/', 14],
				['/hello/', 6],
				['/explore/', 2],
				['/info/', 1],
				['/coolio/', 1]
			],
			referrers: [
				['source.com', 7],
				['demo.com', 4],
				['com.twitter.android', 3],
				['www.google.com', 1]
			],
			time_zones: [
				[
					['America/Los_Angeles', 6],
					['Asia/Tokyo', 4],
					['America/Chicago', 2],
					['America/New_York', 2],
					['UTC', 1],
					['Europe/Berlin', 1],
					['Asia/Jakarta', 1],
					['Africa/Lagos', 1],
					['Europe/London', 1],
					['Europe/Lisbon', 1]
				]
			],
			utm_campaigns: [
				[
					['spring_sale', 8],
					['product_launch', 5],
					['b2b_outreach', 5],
					['partner_promo', 3],
					['weekly_update', 3]
				]
			],
			utm_sources: [
				[
					['google', 8],
					['linkedin', 5],
					['twitter', 5],
					['referral', 3],
					['newsletter', 3]
				]
			]
		});
	});
});
