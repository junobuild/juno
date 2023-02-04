<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconCopy from '$lib/components/icons/IconCopy.svelte';

	export let value: string;

	const copyToClipboard = async () => await navigator.clipboard.writeText(value);
</script>

<button
	on:click|stopPropagation={copyToClipboard}
	aria-label={`${$i18n.core.copy}: ${value}`}
	title={`${$i18n.core.copy}: ${value}`}
	class="square"
>
	<IconCopy />
</button>
