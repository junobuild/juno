import { uint8ArrayToBase64 } from '@dfinity/utils';

export const mockCertificateDate = new Date(2025, 9, 21, 9, 8, 0, 0);

export const FETCH_CERTIFICATE_INTERVAL = 1000 * 60 * 15; // 15min

export const mockGoogleCertificate = {
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

const toBase64URL = (uint8Array: Uint8Array): string =>
	uint8ArrayToBase64(uint8Array).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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

export const mockClientId =
	'974645666757-ebfaaau4cesdddqahu83e1qqmmmmdrod.apps.googleusercontent.com';
