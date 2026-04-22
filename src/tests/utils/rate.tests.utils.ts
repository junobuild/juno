import type { ObservatoryActor, ObservatoryActor040 } from '$declarations';

export const updateRateConfigNoLimit = async ({
	actor
}: {
	actor: ObservatoryActor | ObservatoryActor040;
}) => {
	// Allow lots of requests
	const { set_rate_config } = actor;

	await set_rate_config(
		{ OpenIdCertificateRequests: null },
		{
			max_tokens: 10_000n,
			time_per_token_ns: 1n // 1 milli per token
		}
	);
};
