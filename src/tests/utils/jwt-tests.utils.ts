import { exportJWK, generateKeyPair, SignJWT, type JWK, type JWTPayload } from 'jose';
import { nanoid } from 'nanoid';

export interface MockOpenIdJwt {
	jwks: { keys: Required<JWK>[] };
	jwt: string;
	kid: string;
	payload: Required<Omit<JWTPayload, 'jti' | 'nbf'>>;
	pubJwk: JWK;
	privateKey: CryptoKey;
}

export const makeMockGoogleOpenIdJwt = async ({
	clientId,
	nonce,
	date,
	...rest
}: {
	clientId: string;
	date: Date;
	nonce?: string;
	kid?: string;
}): Promise<MockOpenIdJwt> => {
	const timestamp = Math.floor(date.getTime() / 1000);

	const payload = {
		iss: 'https://accounts.google.com',
		sub: '123456789012345678901',
		email: 'user@example.com',
		email_verified: true,
		name: 'Hello World',
		given_name: 'Hello',
		family_name: 'World',
		aud: clientId,
		iat: timestamp - 10,
		exp: timestamp + 3600,
		nonce
	} as const;

	return await makeMockOpenIdJwt({
		payload,
		...rest
	});
};

export const makeMockGitHubOpenIdJwt = async ({
	clientId,
	nonce,
	date,
	...rest
}: {
	clientId: string;
	date: Date;
	nonce?: string;
	kid?: string;
}): Promise<MockOpenIdJwt> => {
	const timestamp = Math.floor(date.getTime() / 1000);

	const payload = {
		iss: 'https://api.juno.build/auth/github',
		sub: '44445678901555578901',
		email: 'user@example.com',
		name: 'Hello World',
		preferred_username: 'helloworld',
		aud: clientId,
		iat: timestamp - 10,
		exp: timestamp + 3600,
		nonce
	} as const;

	return await makeMockOpenIdJwt({
		payload,
		...rest
	});
};

const makeMockOpenIdJwt = async ({
	kid,
	payload
}: {
	kid?: string;
	payload: Required<Omit<JWTPayload, 'jti' | 'nbf'>>;
}): Promise<MockOpenIdJwt> => {
	const { publicKey, privateKey } = await generateKeyPair('RS256');

	const pubJwk = await exportJWK(publicKey);
	pubJwk.kty = 'RSA';
	pubJwk.alg = 'RS256';
	pubJwk.kid = kid ?? nanoid();

	const jwt = await makeJwt({
		privateKey,
		pubJwk,
		payload
	});

	return {
		jwks: { keys: [pubJwk as Required<JWK>] },
		jwt,
		kid: pubJwk.kid,
		payload,
		pubJwk,
		privateKey
	};
};

export const makeJwt = async ({
	privateKey,
	pubJwk,
	payload
}: {
	privateKey: CryptoKey;
	pubJwk: JWK;
	payload: Required<Omit<JWTPayload, 'jti' | 'nbf'>>;
}): Promise<string> =>
	await new SignJWT(payload)
		.setProtectedHeader({ alg: 'RS256', kid: pubJwk.kid, typ: 'JWT' })
		.setIssuedAt((payload as { iat: number }).iat)
		.setExpirationTime((payload as { exp: number }).exp)
		.sign(privateKey);
