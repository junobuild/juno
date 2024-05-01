import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { pageViewMock } from './mocks/orbiter.mocks';
import { tick } from './utils/pic-tests.utils';
import { ORBITER_WASM_PATH, controllersInitArgs, downloadOrbiter } from './utils/setup-tests.utils';

describe('Orbiter upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async (version: string) => {
		await tick(pic);

		const destination = await downloadOrbiter(version);

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: ORBITER_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const initPageViews = async () => {
		const { set_page_views } = actor;

		const pagesViews: [AnalyticKey, SetPageView][] = Array.from({ length: 100 }).map(() => [
			{ key: nanoid(), collected_at: 123n },
			pageViewMock
		]);

		const results = await set_page_views(pagesViews);

		expect('Err' in results).toBeFalsy();
	};

	const testPageViews = async () => {
		const { get_page_views } = actor;

		const results = await get_page_views({
			to: toNullable(),
			from: toNullable(),
			satellite_id: toNullable()
		});

		expect(results).toHaveLength(100);
	};

	const satellite_id = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

	describe('v0.0.6 -> v0.0.7', async () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadOrbiter('0.0.6');

			const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor>({
				idlFactory: idlFactorOrbiter,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			const { set_satellite_configs } = actor;

			await expect(
				set_satellite_configs([
					[
						satellite_id,
						{
							updated_at: [],
							enabled: true
						}
					]
				])
			).resolves.not.toThrowError();
		});

		it('should still list all page views after upgrade', async () => {
			await initPageViews();

			await testPageViews();

			await upgrade();

			await testPageViews();
		});
	});
});
