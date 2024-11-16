import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';

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
						derivation_origin: [domainName]
					}
				]
			}
		: {
				...config,
				...(nonNullish(fromNullable(config.internet_identity)) && {
					internet_identity: [
						{
							...fromNullable(config.internet_identity),
							derivation_origin: [domainName]
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
				derivation_origin: []
			}
		]
	})
});
