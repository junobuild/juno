import { idlFactoryObservatory, type ObservatoryActor, type ObservatoryDid } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import {
	FETCH_CERTIFICATE_INTERVAL,
	mockCertificateDate,
	mockGoogleCertificate
} from '../../mocks/observatory.mocks';
import {
	assertOpenIdHttpsOutcalls,
	failOpenIdHttpsOutCall,
	finalizeOpenIdHttpsOutCall
} from '../../utils/observatory-openid-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > OpenId', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

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
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const mapGoogleCertificateToJwks = (cert: typeof mockGoogleCertificate): ObservatoryDid.Jwks => ({
		keys: cert.keys
			.sort((a, b) => a.kid.localeCompare(b.kid))
			.map((key) => {
				const kty = key.kty.toUpperCase();

				const mappedType: ObservatoryDid.JwkType =
					kty === 'RSA'
						? { RSA: null }
						: kty === 'EC'
							? { EC: null }
							: kty === 'OKP'
								? { OKP: null }
								: { oct: null };

				const params: ObservatoryDid.JwkParams =
					kty === 'RSA'
						? { Rsa: { e: key.e, n: key.n } }
						: kty === 'EC'
							? {
									Ec: {
										x: (key as unknown as { x: string }).x,
										y: (key as unknown as { y: string }).y,
										crv: (key as unknown as { crv: string }).crv
									}
								}
							: kty === 'OKP'
								? {
										Okp: {
											x: (key as unknown as { x: string }).x,
											crv: (key as unknown as { crv: string }).crv
										}
									}
								: { Oct: { k: (key as unknown as { k: string }).k } };

				return {
					alg: key.alg ? [key.alg] : [],
					kid: key.kid ? [key.kid] : [],
					kty: mappedType,
					params
				};
			})
	});

	const assertGetCertificate = async ({ version }: { version: bigint }) => {
		const { get_openid_certificate } = actor;

		const cert = await get_openid_certificate({
			provider: { Google: null }
		});

		const certificate = fromNullable(cert);

		expect(certificate).not.toBeUndefined();

		expect(certificate).toEqual(
			expect.objectContaining({
				jwks: mapGoogleCertificateToJwks(mockGoogleCertificate),
				expires_at: [],
				created_at: expect.any(BigInt),
				updated_at: expect.any(BigInt),
				version: [version]
			})
		);
	};

	describe('Google certificate', () => {
		it('should start openid monitoring', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring();

			await assertOpenIdHttpsOutcalls({ pic });
		});

		it('should provide certificate', async () => {
			await assertGetCertificate({ version: 1n });
		});

		it('should throw error if openid scheduler is already running', async () => {
			const { start_openid_monitoring } = actor;

			await expect(start_openid_monitoring()).rejects.toThrow(
				'OpenID scheduler for Google already running'
			);
		});

		it('should run a timer to update the certificate', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000); // 15min and 1sec

			await tick(pic);

			const pendingHttpsOutcalls = await pic.getPendingHttpsOutcalls();

			expect(pendingHttpsOutcalls).toHaveLength(1);

			const [{ subnetId, requestId }] = pendingHttpsOutcalls;

			await finalizeOpenIdHttpsOutCall({ subnetId, requestId, pic });
		});

		it('should stop openid monitoring', async () => {
			await pic.advanceTime(1000); // A small delay of 5sec to ensure a new timer was rescheduled

			await tick(pic);

			const { stop_openid_monitoring } = actor;

			await expect(stop_openid_monitoring()).resolves.toBeNull();
		});

		it('should still provide certificate', async () => {
			await assertGetCertificate({ version: 2n });
		});

		it('should have a scheduler timer because stop was called in between', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL); // 15min

			await tick(pic);

			await assertOpenIdHttpsOutcalls({ pic });
		});

		it('should not have rescheduled a timer', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000); // 15min and 1sec

			await tick(pic);

			await expect(pic.getPendingHttpsOutcalls()).resolves.toHaveLength(0);
		});

		it('should throw error if openid scheduler is already stopped', async () => {
			const { stop_openid_monitoring } = actor;

			await expect(stop_openid_monitoring()).rejects.toThrow(
				'OpenID scheduler for Google is not running'
			);
		});

		it('should restart monitoring', async () => {
			const { start_openid_monitoring } = actor;

			await start_openid_monitoring();

			await assertOpenIdHttpsOutcalls({ pic });
		});

		it('should retry with exponential backoff on failure', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000); // 15min and 1sec

			await tick(pic);

			const pendingHttpsOutcalls = await pic.getPendingHttpsOutcalls();

			expect(pendingHttpsOutcalls).toHaveLength(1);

			await failOpenIdHttpsOutCall({ ...pendingHttpsOutcalls[0], pic });

			await pic.advanceTime(120_000 + 1_000); // 2min + 1 sec
			await tick(pic);

			const pendingBackoff1 = await pic.getPendingHttpsOutcalls();

			expect(pendingBackoff1).toHaveLength(1); // retried after 120s

			await failOpenIdHttpsOutCall({ ...pendingBackoff1[0], pic });

			await pic.advanceTime(240_000 + 1_000); // 4min + 1sec
			await tick(pic);

			const pendingBackoff2 = await pic.getPendingHttpsOutcalls();

			expect(pendingBackoff2).toHaveLength(1); // retried after 120s

			await finalizeOpenIdHttpsOutCall({ ...pendingBackoff2[0], pic });
		});
	});
});
