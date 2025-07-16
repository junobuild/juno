import type {
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { pageViewMock, satelliteIdMock } from '../../mocks/orbiter.mocks';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > Assertions > Page Views', () => {
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

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should not set page view for invalid key length', async () => {
		const { set_page_view } = actor;

		const result = await set_page_view(
			{ key: 'x'.repeat(37), collected_at: 123567890n },
			pageViewMock
		);

		expect(result).toEqual({ Err: 'An analytic key must not be longer than 36.' });
	});

	it('should not set page view for invalid session id length', async () => {
		const { set_page_view } = actor;

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				session_id: 'x'.repeat(37)
			}
		);

		expect(result).toEqual({ Err: 'An analytic session ID must not be longer than 36.' });
	});

	it('should not set page view for invalid title length', async () => {
		const { set_page_view } = actor;

		const title = 'x'.repeat(1025);

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				title
			}
		);

		expect(result).toEqual({ Err: `Page event title ${title} is longer than 1024.` });
	});

	it('should not set page view for invalid href length', async () => {
		const { set_page_view } = actor;

		const href = 'x'.repeat(4097);

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				href
			}
		);

		expect(result).toEqual({ Err: `Page event href ${href} is longer than 1024.` });
	});

	it('should not set page view for invalid referrer length', async () => {
		const { set_page_view } = actor;

		const referrer = 'x'.repeat(4097);

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				referrer: [referrer]
			}
		);

		expect(result).toEqual({ Err: `Page event referrer ${referrer} is longer than 4096.` });
	});

	it('should not set page view for invalid user agent length', async () => {
		const { set_page_view } = actor;

		const userAgent = 'x'.repeat(1025);

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				user_agent: [userAgent]
			}
		);

		expect(result).toEqual({ Err: `Page event user_agent ${userAgent} is longer than 1024.` });
	});

	it('should not set page view for invalid time zone length', async () => {
		const { set_page_view } = actor;

		const timeZone = 'x'.repeat(257);

		const result = await set_page_view(
			{ key: nanoid(), collected_at: 123567890n },
			{
				...pageViewMock,
				time_zone: timeZone
			}
		);

		expect(result).toEqual({ Err: `Page event time_zone ${timeZone} is longer than 256.` });
	});

	describe('Campaign', () => {
		it('should not set page view for invalid utm_source length', async () => {
			const { set_page_view } = actor;

			const utm = 'x'.repeat(101);

			const result = await set_page_view(
				{ key: nanoid(), collected_at: 123567890n },
				{
					...pageViewMock,
					campaign: [
						{
							utm_source: utm,
							utm_medium: toNullable(),
							utm_content: toNullable(),
							utm_term: toNullable(),
							utm_campaign: toNullable()
						}
					]
				}
			);

			expect(result).toEqual({ Err: `utm_source ${utm} is longer than 100.` });
		});

		it('should not set page view for invalid utm_medium length', async () => {
			const { set_page_view } = actor;

			const utm = 'x'.repeat(101);

			const result = await set_page_view(
				{ key: nanoid(), collected_at: 123567890n },
				{
					...pageViewMock,
					campaign: [
						{
							utm_source: 'newsletter',
							utm_medium: toNullable(utm),
							utm_content: toNullable(),
							utm_term: toNullable(),
							utm_campaign: toNullable()
						}
					]
				}
			);

			expect(result).toEqual({ Err: `utm_medium ${utm} is longer than 100.` });
		});

		it('should not set page view for invalid utm_content length', async () => {
			const { set_page_view } = actor;

			const utm = 'x'.repeat(101);

			const result = await set_page_view(
				{ key: nanoid(), collected_at: 123567890n },
				{
					...pageViewMock,
					campaign: [
						{
							utm_source: 'newsletter',
							utm_medium: toNullable(),
							utm_content: toNullable(utm),
							utm_term: toNullable(),
							utm_campaign: toNullable()
						}
					]
				}
			);

			expect(result).toEqual({ Err: `utm_content ${utm} is longer than 100.` });
		});

		it('should not set page view for invalid utm_term length', async () => {
			const { set_page_view } = actor;

			const utm = 'x'.repeat(101);

			const result = await set_page_view(
				{ key: nanoid(), collected_at: 123567890n },
				{
					...pageViewMock,
					campaign: [
						{
							utm_source: 'newsletter',
							utm_medium: toNullable(),
							utm_content: toNullable(),
							utm_term: toNullable(utm),
							utm_campaign: toNullable()
						}
					]
				}
			);

			expect(result).toEqual({ Err: `utm_term ${utm} is longer than 100.` });
		});

		it('should not set page view for invalid utm_campaign length', async () => {
			const { set_page_view } = actor;

			const utm = 'x'.repeat(101);

			const result = await set_page_view(
				{ key: nanoid(), collected_at: 123567890n },
				{
					...pageViewMock,
					campaign: [
						{
							utm_source: 'newsletter',
							utm_medium: toNullable(),
							utm_content: toNullable(),
							utm_term: toNullable(),
							utm_campaign: toNullable(utm)
						}
					]
				}
			);

			expect(result).toEqual({ Err: `utm_campaign ${utm} is longer than 100.` });
		});
	});
});
