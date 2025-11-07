import {
	type ConsoleActor,
	idlFactoryMissionControl,
	type MissionControlActor
} from '$declarations';
import type { MissionControl } from '$declarations/console/console.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { DelegationIdentity } from '@icp-sdk/core/identity';
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
		email: toNullable('user@example.com'),
		name: toNullable('Hello World'),
		given_name: toNullable('Hello'),
		family_name: toNullable('World'),
		picture: toNullable(),
		locale: toNullable()
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

		const {
			OpenId: { data, provider: provider_name }
		} = provider;

		expect('Google' in provider_name).toBeTruthy();

		expect(data).toEqual(mockUserData);

		// Should be a controller
		const missionControlId = fromNullable(missionControl.mission_control_id);

		assertNonNullish(missionControlId);

		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(identity);

		const { get_user } = micActor;

		const user = await get_user();

		expect(user.toText()).toEqual(missionControl.owner.toText());
	});

	// TODO assert controller

	it('should return same mission control', async () => {
		await pic.advanceTime(1000 * 30); // 30s for cooldown guard
		await tick(pic);

		const { authenticate } = consoleActor;

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

		const { mission_control: missionControl } = result.Ok;

		expect(missionControl.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		const provider = fromNullable(missionControl.provider);

		assertNonNullish(provider);

		if ('InternetIdentity' in provider) {
			expect(true).toBeFalsy();

			return;
		}

		const {
			OpenId: { data, provider: provider_name }
		} = provider;

		expect('Google' in provider_name).toBeTruthy();

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

		const { authenticate } = consoleActor;

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

		const { mission_control: missionControl } = result.Ok;

		expect(missionControl.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		const provider = fromNullable(missionControl.provider);

		assertNonNullish(provider);

		if ('InternetIdentity' in provider) {
			expect(true).toBeFalsy();

			return;
		}

		const {
			OpenId: { data, provider: provider_name }
		} = provider;

		expect('Google' in provider_name).toBeTruthy();

		expect(data).toEqual({
			...mockUserData,
			name: toNullable(updatePayload.name),
			given_name: toNullable(updatePayload.given_name),
			family_name: toNullable(updatePayload.family_name),
			email: toNullable(updatePayload.email)
		});
	});
});
