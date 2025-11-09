import { browser } from '$app/environment';
import type { Option } from '$lib/types/utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = (
	$event: LoadEvent
): { redirect_uri: Option<string>; principal: Option<string>; profile: Option<string> } => {
	if (!browser) {
		return {
			redirect_uri: undefined,
			principal: undefined,
			profile: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		redirect_uri: decodeURIComponent(searchParams?.get('redirect_uri') ?? ''),
		principal: searchParams?.get('principal') ?? '',
		profile: decodeURIComponent(searchParams?.get('profile') ?? '')
	};
};
