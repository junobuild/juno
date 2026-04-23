<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { metadataUiName } from '$lib/utils/metadata-ui.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satName = $derived(metadataUiName(satellite));
</script>

<Value>
	{#snippet label()}
		{$i18n.satellites.name}
	{/snippet}

	<p>{satName}</p>
</Value>
