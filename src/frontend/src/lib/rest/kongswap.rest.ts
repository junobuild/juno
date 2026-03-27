import { KongSwapTokenSchema } from '$lib/schemas/kongswap.schema';
import type { KongSwapToken } from '$lib/types/kongswap';
import { assertResponseOk } from '$lib/utils/rest.utils';
import { isEmptyString } from '@dfinity/utils';
import type { PrincipalText } from '@junobuild/schema';

export const fetchKongSwapToken = async ({
	ledgerId
}: {
	ledgerId: PrincipalText;
}): Promise<KongSwapToken | undefined> => {
	const KONGSWAP_API_URL = import.meta.env.VITE_KONGSWAP_API_URL;

	if (isEmptyString(KONGSWAP_API_URL)) {
		return undefined;
	}

	const response = await fetch(`${KONGSWAP_API_URL}/api/tokens/${ledgerId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	assertResponseOk(response, 'Fetching KongSwap failed.');

	const data = await response.json();

	return KongSwapTokenSchema.parse(data);
};
