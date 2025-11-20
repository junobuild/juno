import type { ObservatoryActor } from '$declarations';

export const updateRateConfigNoLimit = async ({ actor }: { actor: ObservatoryActor }) => {
	// Allow lots of requests
	const { update_rate_config } = actor;

	await update_rate_config(
		{ OpenIdCertificateRequests: null },
		{
			max_tokens: 10_000n,
			time_per_token_ns: 1n // 1 milli per token
		}
	);
};
