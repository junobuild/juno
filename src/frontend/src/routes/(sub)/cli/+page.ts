import { browser } from '$app/environment';
import type { Option } from '$lib/types/utils';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = (
	$event: LoadEvent
): { redirect_uri: Option<string>; principal: Option<string> } => {
	if (!browser) {
		return {
			redirect_uri: undefined,
			principal: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		redirect_uri: decodeURIComponent(searchParams?.get('redirect_uri') ?? ''),
		principal: decodeURIComponent(searchParams?.get('principal') ?? '')
	};
};
