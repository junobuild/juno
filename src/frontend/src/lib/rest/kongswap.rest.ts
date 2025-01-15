import { KongSwapTokensSchema } from '$lib/schema/kongswap.schema';
import type { KongSwapTokens } from '$lib/types/kongswap';
import { isEmptyString } from '@dfinity/utils';

export const fetchKongSwapTokens = async ({
	page,
	limit
}: {
	page: number;
	limit: number;
}): Promise<KongSwapTokens | undefined> => {
	const KONGSWAP_API_URL = import.meta.env.VITE_KONGSWAP_API_URL;

	if (isEmptyString(KONGSWAP_API_URL)) {
		return undefined;
	}

	const response = await fetch(`${KONGSWAP_API_URL}/api/tokens?page=${page}&limit=${limit}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Fetching KongSwap failed.');
	}

	const data = await response.json();

	return KongSwapTokensSchema.parse(data);
};
