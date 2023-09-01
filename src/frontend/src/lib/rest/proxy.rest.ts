const VITE_PROXY_CONFIG_URL = import.meta.env.VITE_PROXY_CONFIG_URL;

export const configProxy = async (params: {
	orbiterId: string;
	satelliteId: string;
	filter: string;
}): Promise<string> => {
	const response = await fetch(VITE_PROXY_CONFIG_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(params)
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Registering proxy failed. ${text}`);
	}

	const result: { token: string } = await response.json();

	return result.token;
};
