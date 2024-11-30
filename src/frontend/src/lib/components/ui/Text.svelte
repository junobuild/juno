<script lang="ts">
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat, i18nText } from '$lib/utils/i18n.utils';

	interface Props {
		key: string;
		value: string;
		placeholder?: string;
	}

	let { key, value, placeholder = '{0}' }: Props = $props();
</script>

<Html
	text={i18nFormat(i18nText({ i18n: $i18n, labelKey: key }), [
		{
			placeholder,
			value
		}
	])}
/>
