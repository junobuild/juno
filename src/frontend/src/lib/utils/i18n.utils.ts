import { i18n } from '$lib/stores/i18n.store';
import { keyOf } from '$lib/utils/utils';
import { get } from 'svelte/store';

export const i18nFormat = (
	text: string,
	params: { placeholder: string; value: string }[]
): string => {
	params.forEach((param) => {
		const split = text.split(param.placeholder);
		text = split[0] + param.value + (split.length > 1 ? split[1] : '');
	});

	return text;
};

export const i18nText = ({ i18n, labelKey }: { i18n: I18n; labelKey: string }): string => {
	const [group, key] = labelKey.split('.');
	const obj = keyOf({ obj: i18n, key: group });
	return keyOf({ obj, key });
};

export const i18nCapitalize = (text: string): string => {
	const [firstLetter, ...rest] = text;
	return `${firstLetter.toUpperCase()}${rest.join('')}`;
};

export const groupLabel = (labelKey: string): string | undefined =>
	i18nText({ i18n: get(i18n), labelKey });
