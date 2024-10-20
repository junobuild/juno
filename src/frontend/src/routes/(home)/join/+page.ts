import { browser } from '$app/environment';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ($event: LoadEvent): { invite: string | null | undefined } => {
	if (!browser) {
		return {
			invite: undefined
		};
	}

	const {
		url: { searchParams }
	} = $event;

	return {
		invite: decodeURIComponent(searchParams?.get('invite') ?? '')
	};
};
