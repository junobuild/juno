import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe('Satellite > Automation > Configuration', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock();

		pic = p;
		actor = a;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertGuards = () => {
		it('should throw errors on setting config', async () => {
			const { set_automation_config } = actor;

			await expect(
				set_automation_config({
					openid: [],
					version: [10n]
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on getting config', async () => {
			const { get_auth_config } = actor;

			await expect(get_auth_config()).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertGuards();
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		assertGuards();
	});
});
