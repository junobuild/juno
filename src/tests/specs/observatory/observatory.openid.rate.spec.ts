import { idlFactoryObservatory, type ObservatoryActor } from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
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

	const loadCertificate = async () => {
		const { start_openid_monitoring, stop_openid_monitoring } = actor;

		await start_openid_monitoring();

		await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });

		// We do not need to always fetch a new certificate for this suite
		// We are interested in the guards
		await stop_openid_monitoring();
	};

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

	it('should provide certificate', async () => {
		await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
	});

	describe.each([
		{ title: '30s', advanceToRejection: 20_000, advanceToSuccess: 20_000 }, // 20s < 30s < 20s + 20s
		{ title: '60s', advanceToRejection: 50_000, advanceToSuccess: 20_000 }, // 50s < 60s < 50s + 20s
		{ title: '120s', advanceToRejection: 100_000, advanceToSuccess: 30_000 } // 100s < 120s < 100s + 30s
	])('$title', ({ advanceToRejection, advanceToSuccess }) => {
		it('should reject request', async () => {
			await pic.advanceTime(advanceToRejection);
			await tick(pic);

			const { get_openid_certificate } = actor;

			await expect(
				get_openid_certificate({
					provider: { Google: null }
				})
			).rejects.toThrow('Too many requests');
		});

		it('should provide certificate', async () => {
			await pic.advanceTime(advanceToSuccess);
			await tick(pic);

			await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
		});
	});

	describe.each([
		{ title: '30s', advanceToRejection: 30_000 }, // 30s
		{ title: '60s', advanceToRejection: 60_000 }, // 1min 30
		{ title: '120s', advanceToRejection: 2 * 60_000 }, // 3min 30
		{ title: '300s', advanceToRejection: 5 * 60_000 }, // 8min 30
		{ title: '300s', advanceToRejection: 5 * 60_000 } // 13min 30
	])('$title', ({ advanceToRejection }) => {
		it('should reject request until cooldown', async () => {
			await pic.advanceTime(advanceToRejection);
			await tick(pic);

			const { get_openid_certificate } = actor;

			await expect(
				get_openid_certificate({
					provider: { Google: null }
				})
			).rejects.toThrow('Too many requests');
		});
	});

	it('should provide certificate after cooldown', async () => {
		await pic.advanceTime(90_000); // 1min 30 after 13min 30
		await tick(pic);

		await assertGetCertificate({ version: 1n, actor, jwks: mockJwks });
	});
});
