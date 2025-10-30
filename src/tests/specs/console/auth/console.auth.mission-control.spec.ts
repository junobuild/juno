import type { ConsoleActor } from '$declarations';
import type { MissionControl } from '$declarations/console/console.did';
import type { DelegationIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { authenticateAndMakeIdentity } from '../../../utils/auth-identity-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../../utils/auth-tests.utils';
import { makeJwt, type MockOpenIdJwt } from '../../../utils/jwt-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Satellite > Auth > Mission Control', () => {
	let pic: PocketIc;

	let consoleActor: Actor<ConsoleActor>;

	let session: TestSession;

	let mockJwt: MockOpenIdJwt;
	let mockIdentity: DelegationIdentity;

	const mockUserData = {
		provider: 'google',
		banned: null,
		providerData: {
			openid: {
				email: 'user@example.com',
				name: 'Hello World',
				givenName: 'Hello',
				familyName: 'World',
				picture: null,
				locale: null
			}
		}
	};

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor },
			session: s
		} = await setupConsoleAuth();

		pic = p;
		consoleActor = actor;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should register a new user and spin a mission control', async () => {
		const {
			identity,
			mission_control: missionControl,
			jwt
		} = await authenticateAndMakeIdentity<{ mission_control: MissionControl }>({
			pic,
			session,
			actor: consoleActor
		});

		mockJwt = jwt;
		mockIdentity = identity;

		expect(missionControl.owner.toText()).toEqual(identity.getPrincipal().toText());

		const provider = fromNullable(missionControl.provider);

		assertNonNullish(provider);

		if ('InternetIdentity' in provider) {
			expect(true).toBeFalsy();

			return;
		}

		const { Google: data } = provider;
		expect(data).toEqual(mockUserData);
	});

	// TODO assert controller

	it('should return same mission control', async () => {
		await pic.advanceTime(1000 * 30); // 30s for cooldown guard
		await tick(pic);

		const { authenticate_user } = consoleActor;

		const result = await authenticate_user({
			OpenId: {
				jwt: mockJwt.jwt,
				session_key: session.publicKey,
				salt: session.salt
			}
		});

		if (!('Ok' in result)) {
			expect(true).toBeFalsy();

			return;
		}

		const { mission_control: missionControl } = result.Ok;

		expect(missionControl.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		// TODO
		// const data = await fromArray(user.data);
		// expect(data).toEqual(mockUserData);
	});

	it('should update user data', async () => {
		await pic.advanceTime(1000 * 30); // 30s for cooldown guard
		await tick(pic);

		const updatePayload = {
			...mockJwt.payload,
			name: 'Super Duper',
			given_name: 'Super',
			family_name: 'Duper',
			email: 'test@test1.com'
		};

		const newJwt = await makeJwt({
			payload: updatePayload,
			pubJwk: mockJwt.pubJwk,
			privateKey: mockJwt.privateKey
		});

		const { authenticate_user } = consoleActor;

		const result = await authenticate_user({
			OpenId: {
				jwt: newJwt,
				session_key: session.publicKey,
				salt: session.salt
			}
		});

		if (!('Ok' in result)) {
			expect(true).toBeFalsy();

			return;
		}

		const { mission_control: missionControl } = result.Ok;

		expect(missionControl.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		// TODO
		// const data = await fromArray(user.data);
		//
		// expect(data).toEqual({
		// 	...mockUserData,
		// 	providerData: {
		// 		openid: {
		// 			...mockUserData.providerData.openid,
		// 			name: updatePayload.name,
		// 			givenName: updatePayload.given_name,
		// 			familyName: updatePayload.family_name,
		// 			email: updatePayload.email
		// 		}
		// 	}
		// });
	});
});
