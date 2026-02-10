import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import type { OpenIdProvider } from '$declarations/observatory/observatory.did';
import { type Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import {
	GITHUB_ACTIONS_OPEN_ID_PROVIDER,
	GITHUB_AUTH_OPEN_ID_PROVIDER,
	GOOGLE_OPEN_ID_PROVIDER
} from '../../../constants/auth-tests.constants';
import { mockCertificateDate, mockGoogleClientId } from '../../../mocks/jwt.mocks';
import { FETCH_CERTIFICATE_INTERVAL } from '../../../mocks/observatory.mocks';
import { makeMockGoogleOpenIdJwt } from '../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Observatory > OpenId > Upgrade', async () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;
	let observatoryId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const { jwks: mockJwks } = await makeMockGoogleOpenIdJwt({
		clientId: mockGoogleClientId,
		date: mockCertificateDate
	});

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

	const assertNoHttpsOutcalls = async ({ provider }: { provider: OpenIdProvider }) => {
		await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);

		const { get_openid_certificate } = actor;

		const cert = await get_openid_certificate({
			provider
		});

		expect(fromNullable(cert)).toBeUndefined();
	};

	describe.each([
		{
			method: 'google',
			provider: GOOGLE_OPEN_ID_PROVIDER
		},
		{
			method: 'github_auth',
			provider: GITHUB_AUTH_OPEN_ID_PROVIDER
		},
		{
			method: 'github_actions',
			provider: GITHUB_ACTIONS_OPEN_ID_PROVIDER
		}
	])('$method', ({ method, provider }) => {
		it('should not start monitoring after upgrade if never stopped', async () => {
			await upgradeCurrent();

			await tick(pic);

			await assertNoHttpsOutcalls({ provider });
		});

		it('should not start monitoring after upgrade if stopped', async () => {
			const { start_openid_monitoring, stop_openid_monitoring } = actor;

			await start_openid_monitoring(provider);

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({
				pic,
				jwks: mockJwks,
				method: method as 'google' | 'github_auth' | 'github_actions'
			});

			await pic.advanceTime(1000);
			await tick(pic);

			await stop_openid_monitoring(provider);

			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000);

			// Delayed HTTPs outcalls which happens after stop
			await assertOpenIdHttpsOutcalls({
				pic,
				jwks: mockJwks,
				method: method as 'google' | 'github_auth' | 'github_actions'
			});

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);

			await upgradeCurrent();

			await tick(pic);

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);
		});

		it('should still hold certificate after upgrade', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring(provider);

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({
				pic,
				jwks: mockJwks,
				method: method as 'google' | 'github_auth' | 'github_actions'
			});

			await upgradeCurrent();

			const { get_openid_certificate } = actor;

			const cert = await get_openid_certificate({
				provider
			});

			expect(fromNullable(cert)).not.toBeUndefined();
		});

		it('should restart monitoring after upgrade if running', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring(provider);

			// HTTPs outcalls after stat
			await assertOpenIdHttpsOutcalls({
				pic,
				jwks: mockJwks,
				method: method as 'google' | 'github_auth' | 'github_actions'
			});

			await upgradeCurrent();

			await pic.advanceTime(1000);
			await tick(pic);

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(1);

			// HTTPs outcalls after restat
			await assertOpenIdHttpsOutcalls({
				pic,
				jwks: mockJwks,
				method: method as 'google' | 'github_auth' | 'github_actions'
			});
		});
	});
});
