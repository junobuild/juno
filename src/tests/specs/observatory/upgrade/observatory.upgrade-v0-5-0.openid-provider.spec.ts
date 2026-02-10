import {
	idlFactoryObservatory,
	idlFactoryObservatory040,
	type ObservatoryActor,
	type ObservatoryActor040
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { GITHUB_AUTH_OPEN_ID_PROVIDER } from '../../../constants/auth-tests.constants';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { mockGitHubClientId } from '../../../mocks/jwt.mocks';
import { generateNonce } from '../../../utils/auth-nonce-tests.utils';
import { makeMockGitHubAuthOpenIdJwt } from '../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { downloadObservatory } from '../../../utils/setup-tests.utils';

describe('Observatory > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor040>;
	let observatoryId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		const destination = await downloadObservatory({ junoVersion: '0.0.67', version: '0.5.0' });

		await pic.upgradeCanister({
			canisterId: observatoryId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);
		await pic.setTime(currentDate.getTime());

		const destination = await downloadObservatory({ junoVersion: '0.0.66', version: '0.4.0' });

		const { actor: obsA, canisterId } = await pic.setupCanister<ObservatoryActor040>({
			idlFactory: idlFactoryObservatory040,
			wasm: destination,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		actor = obsA;
		observatoryId = canisterId;

		actor.setIdentity(controller);

		// Start fetching OpenID Jwts in Observatory
		const { start_openid_monitoring } = actor;
		await start_openid_monitoring({ GitHub: null });

		// Just a user for simplicity reason, this way we can use makeMockGitHubOpenIdJwt as it
		const user = Ed25519KeyIdentity.generate();
		const { nonce } = await generateNonce({ caller: user });

		// Load the related certificate
		const mockJwt = await makeMockGitHubAuthOpenIdJwt({
			clientId: mockGitHubClientId,
			date: currentDate,
			nonce
		});

		const { jwks } = mockJwt;

		await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_auth' });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should migrate heap OpenId.certificates and OpenId.Schedulers to OpenIdProvider.GitHubAuth', async () => {
		await expect(upgrade()).resolves.not.toThrowError();
	});

	it('should still return certificate', async () => {
		const newActor = pic.createActor<ObservatoryActor>(idlFactoryObservatory, observatoryId);
		newActor.setIdentity(controller);

		const { get_openid_certificate } = newActor;

		const cert = await get_openid_certificate({
			provider: GITHUB_AUTH_OPEN_ID_PROVIDER
		});

		expect(fromNullable(cert)).not.toBeUndefined();
	});
});
