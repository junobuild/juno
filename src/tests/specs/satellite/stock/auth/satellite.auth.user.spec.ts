import type { SatelliteActor } from '$declarations';
import type { Doc } from '$declarations/satellite/satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { DelegationIdentity } from '@icp-sdk/core/identity';
import { fromArray } from '@junobuild/utils';
import { authenticateAndMakeIdentity } from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';
import { makeJwt, type MockOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';

describe('Satellite > Auth > User', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;

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
			satellite: { actor },
			session: s
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should register a new user', async () => {
		const {
			identity,
			doc: user,
			jwt
		} = await authenticateAndMakeIdentity<{ doc: Doc }>({
			pic,
			session,
			actor: satelliteActor
		});

		mockJwt = jwt;
		mockIdentity = identity;

		expect(user.owner.toText()).toEqual(identity.getPrincipal().toText());

		const data = await fromArray(user.data);

		expect(data).toEqual(mockUserData);
	});

	it('should return same user', async () => {
		await pic.advanceTime(1000 * 30); // 30s for cooldown guard
		await tick(pic);

		const { authenticate } = satelliteActor;

		const result = await authenticate({
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

		const { doc: user } = result.Ok;

		expect(user.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		const data = await fromArray(user.data);

		expect(data).toEqual(mockUserData);
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

		const { authenticate } = satelliteActor;

		const result = await authenticate({
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

		const { doc: user } = result.Ok;

		expect(user.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		const data = await fromArray(user.data);

		expect(data).toEqual({
			...mockUserData,
			providerData: {
				openid: {
					...mockUserData.providerData.openid,
					name: updatePayload.name,
					givenName: updatePayload.given_name,
					familyName: updatePayload.family_name,
					email: updatePayload.email
				}
			}
		});
	});
});
