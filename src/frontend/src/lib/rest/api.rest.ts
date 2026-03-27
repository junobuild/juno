import { JUNO_API_URL } from '$lib/constants/app.constants';
import { ApiExchangePriceResponseSchema } from '$lib/schemas/api.schema';
import type { ApiExchangePriceResponse } from '$lib/types/api';
import { assertResponseOk } from '$lib/utils/rest.utils';
import { isEmptyString } from '@dfinity/utils';
import type { PrincipalText } from '@junobuild/schema';

export const fetchExchangePrice = async ({
	ledgerId
}: {
	ledgerId: PrincipalText;
}): Promise<ApiExchangePriceResponse | undefined> => {
	if (isEmptyString(JUNO_API_URL)) {
		return undefined;
	}

	const response = await fetch(`${JUNO_API_URL}/v1/exchange/price/${ledgerId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	assertResponseOk(response, 'Fetching Juno API failed.');

	const data = await response.json();

	return ApiExchangePriceResponseSchema.parse(data);
};
