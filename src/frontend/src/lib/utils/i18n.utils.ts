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

export const groupLabel = (labelKey: string): string | undefined => {
	const [group, key] = labelKey.split('.');
	const labels = get(i18n);
	const obj = keyOf({ obj: labels, key: group });
	return keyOf({ obj, key });
};
