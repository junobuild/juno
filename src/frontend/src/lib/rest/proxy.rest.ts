const PROXY_REGISTRATIONS_URL = import.meta.env.VITE_PROXY_REGISTRATIONS_URL;
const FUNCTION_PLACEHOLDER = '{function}';

export const registerProxy = async (params: {
	orbiterId: string;
	origins?: string[];
}): Promise<string> => {
	const response = await fetch(
		`${PROXY_REGISTRATIONS_URL.replace(FUNCTION_PLACEHOLDER, 'register')}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		}
	);

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Registering proxy failed. ${text}`);
	}

	const result: { principal: string } = await response.json();

	return result.principal;
};
