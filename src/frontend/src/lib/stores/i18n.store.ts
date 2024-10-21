import en from '$lib/i18n/en.json';

import type { Languages } from '$lib/types/languages';
import { getLocalStorageLang, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import { writable, type Readable } from 'svelte/store';

const zhCnI18n = async (): Promise<I18n> => ({
	lang: 'zh-cn',
	...(await import(`../i18n/zh-cn.json`))
});

const enI18n = (): I18n =>
	({
		lang: 'en',
		...en
	}) as I18n;

const loadLanguage = (lang: Languages): Promise<I18n> => {
	switch (lang) {
		case 'zh-cn':
			return zhCnI18n();
		default:
			return Promise.resolve(enI18n());
	}
};

const switchLanguage = (lang: Languages) => setLocalStorageItem({ key: 'lang', value: lang });

export interface I18nStore extends Readable<I18n> {
	init: () => Promise<void>;
	switchLang: (lang: Languages) => Promise<void>;
}

const initI18n = (): I18nStore => {
	const { subscribe, set } = writable<I18n>({
		lang: 'en',
		...en
	});

	return {
		subscribe,

		init: async () => {
			const lang: Languages = getLocalStorageLang();

			if (lang === 'en') {
				switchLanguage(lang);
				// No need to reload the store, English is already the default
				return;
			}

			const bundle: I18n = await loadLanguage(lang);
			set(bundle);

			switchLanguage(lang);
		},

		switchLang: async (lang: Languages) => {
			const bundle: I18n = await loadLanguage(lang);
			set(bundle);

			switchLanguage(lang);
		}
	};
};

export const i18n = initI18n();
