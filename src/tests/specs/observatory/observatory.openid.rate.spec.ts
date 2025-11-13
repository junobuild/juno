import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { CALLER_NOT_CONTROLLER_OBSERVATORY_MSG } from '../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../mocks/jwt.mocks';
import { makeMockGoogleOpenIdJwt } from '../../utils/jwt-tests.utils';
import {
	assertGetCertificate,
	assertOpenIdHttpsOutcalls
} from '../../utils/observatory-openid-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > OpenId > Rate', async () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	const { jwks: mockJwks } = await makeMockGoogleOpenIdJwt({
		clientId: mockClientId,
		date: mockCertificateDate
	});

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(mockCertificateDate.getTime());

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await loadCertificate();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const loadCertificate = async () => {
		const { start_openid_monitoring, stop_openid_monitoring } = actor;

		await start_openid_monitoring();

		await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });

		// We do not need to always fetch a new certificate for this suite
		// We are interested in the guards
		await stop_openid_monitoring();
	};

	const setRateConfig = async (customActor?: ObservatoryActor) => {
		const { update_rate_config } = customActor ?? actor;

		await update_rate_config(
			{ OpenIdCertificateRequests: null },
			{
				max_tokens: 1n,
				time_per_token_ns: 2n * 60n * 1_000_000_000n // 2min
			}
		);
	};

	const assertControllers = (actor: () => ObservatoryActor) => {
		it('should throw errors on updating rate config for not a controller', async () => {
			await expect(setRateConfig(actor())).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertControllers(() => actor);
	});

	describe('Some user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeEach(() => {
			actor.setIdentity(user);
		});

		describe('Without config', () => {
			it('should reject request', async () => {
				const { get_openid_certificate } = actor;

				await expect(
					get_openid_certificate({
						provider: { Google: null }
					})
				).rejects.toThrow(
					'Cannot increment OpenID certificate requests: rates are not configured.'
				);
			});
		});

		describe('With config', () => {
			beforeAll(async () => {
				actor.setIdentity(controller);

				await setRateConfig();
			});

			it('should provide certificate', async () => {
				await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
			});

			describe.each([
				{ title: '30s', advanceToRejection: 30_000, advanceToSuccess: 91_000 }, // 30s -> 91s (2min 1s)
				{ title: '60s', advanceToRejection: 60_000, advanceToSuccess: 61_000 }, // 60s -> 61s (2min 1s)
				{ title: '115s', advanceToRejection: 115_000, advanceToSuccess: 6_000 } // 115s -> 6s (2min 1s)
			])('$title', ({ advanceToRejection, advanceToSuccess }) => {
				it('should reject request', async () => {
					await pic.advanceTime(advanceToRejection);
					await tick(pic);

					const { get_openid_certificate } = actor;

					await expect(
						get_openid_certificate({
							provider: { Google: null }
						})
					).rejects.toThrow('Rate limit reached, try again later.');
				});

				it('should provide certificate', async () => {
					await pic.advanceTime(advanceToSuccess);
					await tick(pic);

					await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
				});
			});
		});
	});

	describe('Controller', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should provide certificate anytime for controllers', async () => {
			await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });

			await pic.advanceTime(30_000);
			await tick(pic);

			await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
		});
	});
});
