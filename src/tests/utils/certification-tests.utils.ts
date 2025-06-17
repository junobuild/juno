import type { HttpResponse as OrbiterHttpResponse } from '$declarations/orbiter/orbiter.did';
import type { HttpResponse as SatelliteHttpResponse } from '$declarations/satellite/satellite.did';
import type { PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { verifyRequestResponsePair, type Request } from '@dfinity/response-verification';
import { assertNonNullish } from '@dfinity/utils';

const CERTIFICATE_VERSION = 2;

const NS_PER_MS = 1e6;
const MS_PER_S = 1e3;
const S_PER_MIN = 60;

const getRootKey = async (pic: PocketIc): Promise<ArrayBufferLike> => {
	const subnets = await pic.getApplicationSubnets();
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
	response,
	statusCode = 200
}: {
	pic: PocketIc;
	currentDate: Date;
	canisterId: Principal;
	request: Request;
	response: SatelliteHttpResponse | OrbiterHttpResponse;
	statusCode?: number;
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

	const { statusCode: responseStatusCode } = verificationResponse;

	expect(responseStatusCode).toBe(statusCode);
};
