export class RestResponseError extends Error {}

export const assertResponseOk: (
	response: Response,
	message?: string
	// eslint-disable-next-line local-rules/prefer-object-params
) => asserts response is Response & { ok: true } = (response: Response, message?: string): void => {
	if (!response.ok) {
		throw new RestResponseError(message, { cause: response });
	}
};
