<script lang="ts">
	import { stopPropagation } from 'svelte/legacy';

	import IconCopy from '$lib/components/icons/IconCopy.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		value: string;
	}

	let { value }: Props = $props();

	const copyToClipboard = async () => await navigator.clipboard.writeText(value);
</script>

<button
	onclick={stopPropagation(copyToClipboard)}
	aria-label={`${$i18n.core.copy}: ${value}`}
	title={`${$i18n.core.copy}: ${value}`}
	class="square"
>
	<IconCopy />
</button>
