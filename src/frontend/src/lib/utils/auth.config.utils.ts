import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';

export const buildSetAuthenticationConfig = ({
	config,
	domainName
}: {
	config: AuthenticationConfig | undefined;
	domainName: string;
}): AuthenticationConfig =>
	isNullish(config)
		? {
				internet_identity: [
					{
						derivation_origin: [domainName],
						external_alternative_origins: toNullable()
					}
				]
			}
		: {
				...config,
				...(nonNullish(fromNullable(config.internet_identity)) && {
					internet_identity: [
						{
							...fromNullable(config.internet_identity),
							derivation_origin: [domainName],
							external_alternative_origins: toNullable()
						}
					]
				})
			};

export const buildDeleteAuthenticationConfig = (
	config: AuthenticationConfig
): AuthenticationConfig => ({
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
