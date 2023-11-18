<script lang="ts">
	import { i18nFormat, i18nText } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';

	export let key: string;
	export let value: string;
	export let placeholder = '{0}';
</script>

{@html i18nFormat(i18nText({ i18n: $i18n, labelKey: key }), [
	{
		placeholder,
		value
	}
])}
