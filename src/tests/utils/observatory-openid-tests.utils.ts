import type { ObservatoryActor, ObservatoryDid } from '$declarations';
import { type Actor, type PocketIc, CanisterHttpMethod } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import type { MockOpenIdJwt } from './jwt-tests.utils';
import { toBodyJson } from './orbiter-tests.utils';
import { tick } from './pic-tests.utils';

export const assertOpenIdHttpsOutcalls = async ({
	pic,
	jwks,
	method = 'google'
}: {
	pic: PocketIc;
	jwks: MockOpenIdJwt['jwks'];
	method?: 'google' | 'github';
}) => {
	await tick(pic);

	const pendingHttpOutCalls = await pic.getPendingHttpsOutcalls();

	// We assert that the expected GitHub or Google certificate was requested
	const pendingRequestedHttpOutCall = pendingHttpOutCalls.find(
		({ url }) =>
			url ===
			(method === 'github'
				? 'https://api.juno.build/v1/auth/certs'
				: 'https://www.googleapis.com/oauth2/v3/certs')
	);

	expect(pendingRequestedHttpOutCall).not.toBeUndefined();

	// For simplicity reasons - to integrate the GitHub test within the existing suite - we resolve
	// all pending certificate calls
	for (const pendingHttpOutCall of pendingHttpOutCalls) {
		const { requestId, subnetId, headers: headersArray, body, httpMethod } = pendingHttpOutCall;

		expect(httpMethod).toEqual(CanisterHttpMethod.GET);

		const headers = headersArray.reduce<Record<string, string>>(
			(acc, [key, value]) => ({ ...acc, [key]: value }),
			{}
		);

		expect(headers['Accept']).toEqual('application/json');

		expect(body).toHaveLength(0);

		await finalizeOpenIdHttpsOutCall({ subnetId, requestId, pic, jwks });
	}
};

export const failOpenIdHttpsOutCall = async ({
	pic,
	...params
}: {
	subnetId: Principal;
	requestId: number;
	pic: PocketIc;
}) => {
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

export const finalizeOpenIdHttpsOutCall = async ({
	pic,
	jwks,
	...params
}: {
	subnetId: Principal;
	requestId: number;
	pic: PocketIc;
	jwks: MockOpenIdJwt['jwks'];
}) => {
	await pic.mockPendingHttpsOutcall({
		...params,
		response: {
			type: 'success',
			body: toBodyJson(jwks),
			statusCode: 200,
			headers: []
		}
	});

	await tick(pic);
};

export const assertGetCertificate = async ({
	version,
	jwks,
	actor
}: { version: bigint; actor: Actor<ObservatoryActor> } & Pick<MockOpenIdJwt, 'jwks'>) => {
	const { get_openid_certificate } = actor;

	const cert = await get_openid_certificate({
		provider: { Google: null }
	});

	const certificate = fromNullable(cert);

	expect(certificate).not.toBeUndefined();

	expect(certificate).toEqual(
		expect.objectContaining({
			jwks: mapGoogleCertificateToJwks({ jwks }),
			created_at: expect.any(BigInt),
			updated_at: expect.any(BigInt),
			version: [version]
		})
	);
};

const mapGoogleCertificateToJwks = ({
	jwks
}: Pick<MockOpenIdJwt, 'jwks'>): ObservatoryDid.Jwks => ({
	keys: jwks.keys
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
