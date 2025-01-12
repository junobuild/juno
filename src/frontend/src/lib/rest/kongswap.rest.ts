import { type KongSwapTokens, KongSwapTokensSchema } from '$lib/types/kongswap';

export const fetchKongSwapTokens = async (): Promise<KongSwapTokens> => {
	const KONGSWAP_API_URL = import.meta.env.VITE_KONGSWAP_API_URL;

	const response = await fetch(`${KONGSWAP_API_URL}/api/tokens?page=1&limit=100`, {
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
