import type { PocketIc } from '@dfinity/pic';
import { CanisterHttpMethod } from '@dfinity/pic/dist/pocket-ic-types';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish } from '@dfinity/utils';
import type { MockOpenIdJwt } from './jwt-test.utils';
import { toBodyJson } from './orbiter-tests.utils';
import { tick } from './pic-tests.utils';

export const assertOpenIdHttpsOutcalls = async ({
	pic,
	jwks
}: {
	pic: PocketIc;
	jwks: MockOpenIdJwt['jwks'];
}) => {
	await tick(pic);

	const [pendingHttpOutCall] = await pic.getPendingHttpsOutcalls();

	assertNonNullish(pendingHttpOutCall);

	const { requestId, subnetId, url, headers: headersArray, body, httpMethod } = pendingHttpOutCall;

	expect(httpMethod).toEqual(CanisterHttpMethod.GET);

	expect(url).toEqual('https://www.googleapis.com/oauth2/v3/certs');

	const headers = headersArray.reduce<Record<string, string>>(
		(acc, [key, value]) => ({ ...acc, [key]: value }),
		{}
	);

	expect(headers['Accept']).toEqual('application/json');

	expect(body).toHaveLength(0);

	await finalizeOpenIdHttpsOutCall({ subnetId, requestId, pic, jwks });
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
