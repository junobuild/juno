<script lang="ts">
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat, i18nText } from '$lib/utils/i18n.utils';

	export let key: string;
	export let value: string;
	export let placeholder = '{0}';
</script>

<Html
	text={i18nFormat(i18nText({ i18n: $i18n, labelKey: key }), [
		{
			placeholder,
			value
		}
	])}
/>
