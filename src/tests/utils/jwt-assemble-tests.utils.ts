import { uint8ArrayToBase64 } from '@dfinity/utils';
import type { MockOpenIdJwt } from './jwt-tests.utils';

export const toBase64URL = (uint8Array: Uint8Array): string =>
	uint8ArrayToBase64(uint8Array).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const enc = (s: string) => new TextEncoder().encode(s);
const randomSig = () => toBase64URL(crypto.getRandomValues(new Uint8Array(256)));

export const assembleJwt = ({
	header,
	payload
}: {
	header: string;
	payload: MockOpenIdJwt['payload'];
}) => [toBase64URL(enc(header)), toBase64URL(enc(JSON.stringify(payload))), randomSig()].join('.');
