import type { HttpResponse } from '$declarations/satellite/satellite.did';
import type { Principal } from '@dfinity/principal';
import { verifyRequestResponsePair, type Request } from '@dfinity/response-verification';
import type { PocketIc } from '@hadronous/pic';
import { assertNonNullish } from '@dfinity/utils';

const CERTIFICATE_VERSION = 2;

const NS_PER_MS = 1e6;
const MS_PER_S = 1e3;
const S_PER_MIN = 60;

const getRootKey = (pic: PocketIc): Promise<ArrayBufferLike> => {
	const subnets = pic.getApplicationSubnets();
	return pic.getPubKey(subnets[0].id);
};

/**
 * @see https://github.com/dfinity/response-verification/blob/main/examples/http-certification/assets/src/tests/src/http.spec.ts
 */
export const assertCertification = async ({
	pic,
	currentDate,
	canisterId,
	request,
	response
}: {
	pic: PocketIc;
	currentDate: Date;
	canisterId: Principal;
	request: Request;
	response: HttpResponse;
}) => {
	const rootKey = await getRootKey(pic);

	const currentTimeNs = BigInt(currentDate.getTime() * NS_PER_MS);
	const maxCertTimeOffsetNs = BigInt(5 * S_PER_MIN * MS_PER_S * NS_PER_MS);

	const { verificationVersion, response: verificationResponse } = verifyRequestResponsePair(
		request,
		response,
		canisterId.toUint8Array(),
		currentTimeNs,
		maxCertTimeOffsetNs,
		new Uint8Array(rootKey),
		CERTIFICATE_VERSION
	);

	expect(verificationVersion).toEqual(CERTIFICATE_VERSION);

	assertNonNullish(verificationResponse);

	const { statusCode } = verificationResponse;

	expect(statusCode).toBe(200);
};
