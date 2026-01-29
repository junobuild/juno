import {
	idlFactoryConsole,
	idlFactoryConsole033,
	idlFactoryObservatory040,
	type ConsoleActor,
	type ConsoleActor033,
	type ConsoleDid,
	type ConsoleDid033,
	type ObservatoryActor040,
	type SatelliteDid
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { mockGitHubClientId } from '../../../mocks/jwt.mocks';
import { authenticateAndMakeIdentity } from '../../../utils/auth-identity-tests.utils';
import { generateNonce } from '../../../utils/auth-nonce-tests.utils';
import type { TestSession } from '../../../utils/auth-tests.utils';
import { deploySegments } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { updateRateConfigNoLimit } from '../../../utils/rate.tests.utils';
import {
	controllersInitArgs,
	downloadConsole,
	downloadObservatory
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > OpenIdProvider > v0.3.3 -> v0.4.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor033>;
	let canisterId: Principal;
	let userIdentity: Identity;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		const destination = await downloadConsole({ junoVersion: '0.0.67', version: '0.4.0' });

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const registerUser = async ({ session }: { session: TestSession }) => {
		actor.setIdentity(session.user);

		const { account, identity } = await authenticateAndMakeIdentity<{
			account: ConsoleDid.Account;
		}>({
			pic,
			session,
			actor,
			method: 'github'
		});

		const provider = fromNullable(account.provider);

		assertNonNullish(provider);

		expect('OpenId' in provider).toBeTruthy();

		userIdentity = identity;
	};

	const setupAuth = async (): Promise<{ session: TestSession }> => {
		// User and session
		const user = Ed25519KeyIdentity.generate();
		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
		const { nonce, salt } = await generateNonce({ caller: user });

		const destination = await downloadObservatory({ junoVersion: '0.0.67', version: '0.5.0' });

		const { actor: obsA } = await pic.setupCanister<ObservatoryActor040>({
			idlFactory: idlFactoryObservatory040,
			wasm: destination,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		const observatoryActor = obsA;
		observatoryActor.setIdentity(controller);

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			openid: [
				{
					providers: [
						[{ GitHub: null }, { client_id: mockGitHubClientId, delegation: [] }] as [
							ConsoleDid033.OpenIdProvider,
							ConsoleDid033.OpenIdProviderConfig
						]
					],
					observatory_id: []
				}
			],
			version: [1n]
		};

		const { set_auth_config } = actor;
		await set_auth_config(config);

		// Start fetching OpenID Jwts in Observatory
		const { start_openid_monitoring } = observatoryActor;
		await start_openid_monitoring({ GitHub: null });

		await updateRateConfigNoLimit({ actor: observatoryActor });

		return {
			session: {
				nonce,
				publicKey,
				salt,
				sessionKey,
				user
			}
		};
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);
		await pic.setTime(currentDate.getTime());

		const destination = await downloadConsole({ junoVersion: '0.0.66', version: '0.3.2' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor033>({
			idlFactory: idlFactoryConsole033,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		actor = c;
		canisterId = cId;

		actor.setIdentity(controller);

		await deploySegments({
			actor,
			withSatellite: true,
			withOrbiter: false
		});

		const { session } = await setupAuth();

		await registerUser({
			session
		});

		// Register set the user as identity
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should migrate heap OpenIdState.certificates to OpenIdProvider.GitHubAuth', async () => {
		await expect(upgrade()).resolves.not.toThrowError();
	});

	it('should still be configured with GitHub respectively newly OpenIdDelegationProvider.GitHub', async () => {
		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { get_auth_config } = newActor;

		const config = fromNullable(await get_auth_config());

		assertNonNullish(config);

		const openid = fromNullable(config.openid);

		assertNonNullish(openid);

		expect('GitHub' in openid.providers[0][0]).toBeTruthy();
	});

	it('should still list the user', async () => {
		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { list_accounts } = newActor;

		const users = await list_accounts();

		expect(users).toHaveLength(1);
		expect(userIdentity.getPrincipal().toText()).toEqual(users[0][0].toText());
	});
});
