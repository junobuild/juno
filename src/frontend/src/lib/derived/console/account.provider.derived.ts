import { account } from '$lib/derived/console/account.derived';
import type { ProviderDataUi } from '$lib/types/provider';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

const provider = derived([account], ([$account]) => fromNullable($account?.provider ?? []));

export const providerDataUi: Readable<ProviderDataUi | undefined> = derived(
	[provider],
	([$provider]) => {
		const openId = nonNullish($provider) && 'OpenId' in $provider ? $provider.OpenId : undefined;
		const openIdData = openId?.data;

		return nonNullish(openIdData)
			? {
					name: fromNullable(openIdData?.name ?? []),
					locale: fromNullable(openIdData?.locale ?? []),
					familyName: fromNullable(openIdData?.family_name ?? []),
					email: fromNullable(openIdData?.email ?? []),
					picture: fromNullable(openIdData?.picture ?? []),
					givenName: fromNullable(openIdData?.given_name ?? []),
					username: fromNullable(openIdData?.preferred_username ?? [])
				}
			: undefined;
	}
);
