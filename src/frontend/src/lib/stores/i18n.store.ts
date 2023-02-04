import en from '$lib/i18n/en.json';

import { readable } from 'svelte/store';

export const i18n = readable<I18n>({
	lang: 'en',
	...en
});
