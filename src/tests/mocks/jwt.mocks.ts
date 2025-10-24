import { toBase64URL } from '../utils/auth-jwt-tests.utils';

export const mockClientId =
	'974645666757-ebfaaau4cesdddqahu83e1qqmmmmdrod.apps.googleusercontent.com';

export const mockJwtBasePayload = {
	iss: 'https://accounts.google.com',
	sub: '123456789012345678901',
	email: 'user@example.com',
	email_verified: true,
	aud: mockClientId,
	iat: Math.floor(Date.now() / 1000) - 10,
	exp: Math.floor(Date.now() / 1000) + 3600
};

export const mockJwt = [
	toBase64URL(
		new TextEncoder().encode(
			JSON.stringify({
				alg: 'RS256',
				kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f',
				typ: 'JWT'
			})
		)
	),

	toBase64URL(
		new TextEncoder().encode(
			JSON.stringify({
				iss: 'https://accounts.google.com',
				sub: '123456789012345678901',
				email: 'user@example.com',
				email_verified: true,
				aud: 'client-id.apps.googleusercontent.com',
				iat: Math.floor(Date.now() / 1000) - 10,
				exp: Math.floor(Date.now() / 1000) + 3600
			})
		)
	),

	// 256-byte random signature
	toBase64URL(crypto.getRandomValues(new Uint8Array(256)))
].join('.');
