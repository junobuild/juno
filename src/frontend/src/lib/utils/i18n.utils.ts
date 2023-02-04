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
