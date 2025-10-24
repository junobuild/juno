import { exportJWK, generateKeyPair, SignJWT, type JWK, type JWTPayload } from 'jose';

export interface MockOpenIdJwt {
	jwks: { keys: Required<JWK>[] };
	jwt: string;
	kid: string;
	payload: Required<Omit<JWTPayload, 'jti' | 'nbf'>>;
}

export const makeMockGoogleOpenIdJwt = async ({
	clientId,
	date,
	nonce
}: {
	clientId: string;
	date: Date;
	nonce?: string;
}): Promise<MockOpenIdJwt> => {
	const { publicKey, privateKey } = await generateKeyPair('RS256');

	const pubJwk = await exportJWK(publicKey);
	pubJwk.kty = 'RSA';
	pubJwk.alg = 'RS256';
	pubJwk.kid = 'test-key-1';

	const timestamp = Math.floor(date.getTime() / 1000);

	const payload = {
		iss: 'https://accounts.google.com',
		sub: '123456789012345678901',
		email: 'user@example.com',
		email_verified: true,
		aud: clientId,
		iat: timestamp - 10,
		exp: timestamp + 3600,
		nonce
	} as const;

	const jwt = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'RS256', kid: pubJwk.kid, typ: 'JWT' })
		.setIssuedAt(payload.iat)
		.setExpirationTime(payload.exp)
		.sign(privateKey);

	return { jwks: { keys: [pubJwk as Required<JWK>] }, jwt, kid: pubJwk.kid, payload };
};
