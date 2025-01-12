import { type KongSwapTokens, KongSwapTokensSchema } from '$lib/types/kongswap';

export const fetchKongSwapTokens = async ({
	page,
	limit
}: {
	page: number;
	limit: number;
}): Promise<KongSwapTokens> => {
	const KONGSWAP_API_URL = import.meta.env.VITE_KONGSWAP_API_URL;

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
