import type { Ed25519KeyIdentity } from '@dfinity/identity';
import { arrayBufferToUint8Array, uint8ArrayToBase64 } from '@dfinity/utils';
// In the future: uint8Array.toBase64({ alphabet: "base64url" })
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
export const toBase64URL = (uint8Array: Uint8Array): string =>
	uint8ArrayToBase64(uint8Array).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const generateSalt = (): Uint8Array => crypto.getRandomValues(new Uint8Array(32));

const buildNonce = async ({ salt, caller }: { salt: Uint8Array; caller: Ed25519KeyIdentity }) => {
	const principal = caller.getPrincipal().toUint8Array();

	const bytes = new Uint8Array(salt.length + principal.byteLength);
	bytes.set(salt);
	bytes.set(principal, salt.length);

	const hash = await crypto.subtle.digest('SHA-256', bytes);

	return toBase64URL(arrayBufferToUint8Array(hash));
};

export const generateNonce = async ({
	caller
}: {
	caller: Ed25519KeyIdentity;
}): Promise<{ nonce: string; salt: Uint8Array }> => {
	const salt = generateSalt();
	const nonce = await buildNonce({ salt, caller });

	return { nonce, salt };
};
