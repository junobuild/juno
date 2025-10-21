import { idlFactoryObservatory, type ObservatoryActor, type ObservatoryDid } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { CanisterHttpMethod } from '@dfinity/pic/dist/pocket-ic-types';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { toBodyJson } from '../../utils/orbiter-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory > OpenId', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2025, 9, 21, 9, 8, 0, 0);

	const FETCH_CERTIFICATE_INTERVAL = 1000 * 60 * 15; // 15min

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

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

	const mockGoogleCertificate = {
		keys: [
			{
				e: 'AQAB',
				use: 'sig',
				alg: 'RS256',
				n: 'to2hcsFNHKquhCdUzXWdP8yxnGqxFWJlRT7sntBgp47HwxB9HFc-U_AB1JT8xe1hwDpWTheckoOfpLgo7_ROEsKpVJ_OXnotL_dgNwbprr-T_EFJV7qOEdHL0KmrnN-kFNLUUSqSChPYVh1aEjlPfXg92Yieaaz2AMMtiageZrKoYnrGC0z4yPNYFj21hO1x6mvGIjmpo6_fe91o-buZNzzkmYlGsFxdvUxYAvgk-5-7D10UTTLGh8bUv_BQT3aRFiVRS5d07dyCJ4wowzxYlPSM6lnfUlvHTWyPL4JysMGeu-tbPA-5QvwCdSGpfWFQbgMq9NznBtWb99r1UStpBQ',
				kty: 'RSA',
				kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f'
			},
			{
				use: 'sig',
				kid: '884892122e2939fd1f31375b2b363ec815723bbb',
				kty: 'RSA',
				e: 'AQAB',
				n: '2ftoBIWdn7XWU1XPPP0B4s-jSKq7nhHZxlT8P52l-OkhpHH8uXUJf8BG6cZFc5lRSx4p0KOjOkfTHUDrbkUOsbL8Q3DCo5z-w35-xvt2iJCe14Em-YrKUbvaRCzBln40c1m6nFf9xJ7y2hTWXFmLYERidFeWEunUbOdF7BzK1r3PJnpCaf9frNZFKh808Q7IR9S--NNIRV8WMJxXhNa0C7ZwvC_Z-arjywdXFhtgiXMQKYhwLWDPtPRQ41CYHTo2wFIh20sBSrzKawHBfloZQSc47CJk85Oz7dA3jsGGj6P00EuvZEoENzk4Czf-bl9wtehJ3xadHDjRkdWDBfhhqQ',
				alg: 'RS256'
			}
		]
	};

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

	const assertHttpsOutcalls = async () => {
		await tick(pic);

		const [pendingHttpOutCall] = await pic.getPendingHttpsOutcalls();

		assertNonNullish(pendingHttpOutCall);

		const {
			requestId,
			subnetId,
			url,
			headers: headersArray,
			body,
			httpMethod
		} = pendingHttpOutCall;

		expect(httpMethod).toEqual(CanisterHttpMethod.GET);

		expect(url).toEqual('https://www.googleapis.com/oauth2/v3/certs');

		const headers = headersArray.reduce<Record<string, string>>(
			(acc, [key, value]) => ({ ...acc, [key]: value }),
			{}
		);

		expect(headers['Accept']).toEqual('application/json');

		expect(body).toHaveLength(0);

		await finalizeHttpsOutCall({ subnetId, requestId });
	};

	const failHttpsOutCall = async (params: { subnetId: Principal; requestId: number }) => {
		await pic.mockPendingHttpsOutcall({
			...params,
			response: {
				type: 'success',
				statusCode: 500,
				headers: [],
				body: new Uint8Array()
			}
		});
		await tick(pic);
	};

	const finalizeHttpsOutCall = async (params: { subnetId: Principal; requestId: number }) => {
		await pic.mockPendingHttpsOutcall({
			...params,
			response: {
				type: 'success',
				body: toBodyJson(mockGoogleCertificate),
				statusCode: 200,
				headers: []
			}
		});

		await tick(pic);
	};

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

			await assertHttpsOutcalls();
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

			const { subnetId, requestId } = pendingHttpsOutcalls[0];

			await finalizeHttpsOutCall({ subnetId, requestId });
		});

		it('should stop openid monitoring', async () => {
			await pic.advanceTime(1000); // A small delay of 5sec to ensure a new timer was rescheduled

			await tick(pic);

			await expect(actor.stop_openid_monitoring()).resolves.toBeNull();
		});

		it('should still provide certificate', async () => {
			await assertGetCertificate({ version: 2n });
		});

		it('should have a scheduler timer because stop was called in between', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL); // 15min

			await tick(pic);

			await assertHttpsOutcalls();
		});

		it('should not have rescheduled a timer', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000); // 15min and 1sec

			await tick(pic);

			await expect((pic.getPendingHttpsOutcalls())).resolves.toHaveLength(0);
		});

		it('should throw error if openid scheduler is already stopped', async () => {
			await expect(actor.stop_openid_monitoring()).rejects.toThrow(
				'OpenID scheduler for Google is not running'
			);
		});

		it('should restart monitoring', async () => {
			await actor.start_openid_monitoring();

			await assertHttpsOutcalls();
		});

		it('should retry with exponential backoff on failure', async () => {
			await pic.advanceTime(FETCH_CERTIFICATE_INTERVAL + 1000); // 15min and 1sec

			await tick(pic);

			const pendingHttpsOutcalls = await pic.getPendingHttpsOutcalls();

			expect(pendingHttpsOutcalls).toHaveLength(1);

			await failHttpsOutCall(pendingHttpsOutcalls[0]);

			await pic.advanceTime(120_000 + 1_000); // 2min + 1 sec
			await tick(pic);

			const pendingBackoff1 = await pic.getPendingHttpsOutcalls();

			expect(pendingBackoff1).toHaveLength(1); // retried after 120s

			await failHttpsOutCall(pendingBackoff1[0]);

			await pic.advanceTime(240_000 + 1_000); // 4min + 1sec
			await tick(pic);

			const pendingBackoff2 = await pic.getPendingHttpsOutcalls();

			expect(pendingBackoff2).toHaveLength(1); // retried after 120s

			await finalizeHttpsOutCall(pendingBackoff2[0]);
		});
	});
});
