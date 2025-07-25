import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';

export const buildSetAuthenticationConfig = ({
	config,
	domainName,
	externalOrigins
}: {
	config: AuthenticationConfig | undefined;
	domainName: string;
	externalOrigins?: string[];
}): AuthenticationConfig => {
	const external_alternative_origins: [] | [string[]] =
		isNullish(externalOrigins) || externalOrigins.length === 0
			? toNullable()
			: toNullable(externalOrigins);

	return isNullish(config)
		? {
				internet_identity: [
					{
						derivation_origin: [domainName],
						external_alternative_origins
					}
				],
				rules: []
			}
		: {
				...config,
				...(nonNullish(fromNullable(config.internet_identity)) && {
					internet_identity: [
						{
							...fromNullable(config.internet_identity),
							derivation_origin: [domainName],
							external_alternative_origins
						}
					]
				})
			};
};

export const buildDeleteAuthenticationConfig = (
	config: AuthenticationConfig
): Omit<AuthenticationConfig, 'rules'> => ({
	...config,
	...(nonNullish(fromNullable(config.internet_identity)) && {
		internet_identity: [
			{
				...fromNullable(config.internet_identity),
				derivation_origin: [],
				external_alternative_origins: []
			}
		]
	})
});

export const assertExternalAlternativeOrigins = (externalOrigins: string[]): { valid: boolean } => {
	const invalidUrl = externalOrigins.find((origin) => URL.parse(`https://${origin}`) === null);

	const containsProtocol = (origin: string): boolean => /^[a-zA-Z]+:\/\//.test(origin);
	const invalidProtocol = externalOrigins.find(containsProtocol);

	return {
		valid: externalOrigins.length === 0 || (isNullish(invalidUrl) && isNullish(invalidProtocol))
	};
};
