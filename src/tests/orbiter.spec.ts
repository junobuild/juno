import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, inject } from 'vitest';
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

	const satellite_id = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

	const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

	const pageView: SetPageView = {
		href: 'https://test.com',
		device: {
			inner_height: 300,
			inner_width: 600
		},
		satellite_id,
		referrer: [],
		session_id: nanoid(),
		title: 'Test',
		time_zone: timeZone,
		user_agent: [
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
		],
		updated_at: []
	};

	describe('user', async () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should set page views', async () => {
			const { set_page_views } = actor;

			const pagesViews: [AnalyticKey, SetPageView][] = [
				[{ key: nanoid(), collected_at: 123n }, pageView],
				[{ key: nanoid(), collected_at: 123n }, pageView]
			];

			await expect(set_page_views(pagesViews)).resolves.not.toThrowError();
		});
	});
});
