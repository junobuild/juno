import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { FETCH_CERTIFICATE_INTERVAL, mockCertificateDate } from '../../mocks/observatory.mocks';
import { assertOpenIdHttpsOutcalls } from '../../utils/observatory-openid-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > OpenId > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;
	let observatoryId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(mockCertificateDate.getTime());

		const { actor: c, canisterId: mId } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		observatoryId = mId;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId: observatoryId,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const assertNoHttpsOutcalls = async () => {
		await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);

		const { get_openid_certificate } = actor;

		const cert = await get_openid_certificate({
			provider: { Google: null }
		});

		expect(fromNullable(cert)).toBeUndefined();
	};

	describe('Google certificate', () => {
		it('should not start monitoring after upgrade if never stopped', async () => {
			await upgradeCurrent();

			await tick(pic);

			await assertNoHttpsOutcalls();
		});

		it('should not start monitoring after upgrade if stopped', async () => {
			const { start_openid_monitoring, stop_openid_monitoring } = actor;

			await start_openid_monitoring();

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({ pic });

			await pic.advanceTime(1000);
			await tick(pic);

			await stop_openid_monitoring();

			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000);

			// Delayed HTTPs outcalls which happens after stop
			await assertOpenIdHttpsOutcalls({ pic });

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);

			await upgradeCurrent();

			await tick(pic);

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);
		});

		it('should still hold certificate after upgrade', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring();

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({ pic });

			await upgradeCurrent();

			const { get_openid_certificate } = actor;

			const cert = await get_openid_certificate({
				provider: { Google: null }
			});

			expect(fromNullable(cert)).not.toBeUndefined();
		});

		it('should restart monitoring after upgrade if running', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring();

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({ pic });

			await upgradeCurrent();

			await pic.advanceTime(1000);
			await tick(pic);

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(1);

			// HTTPs outcalls after restat
			await assertOpenIdHttpsOutcalls({ pic });
		});
	});
});
