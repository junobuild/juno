<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SegmentWithMetadata } from '$lib/types/segment';
	import { metadataUiName } from '$lib/utils/metadata-ui.utils';

	interface Props {
		segment: SegmentWithMetadata;
	}

	let { segment }: Props = $props();

	let segmentName = $derived(metadataUiName(segment));
</script>

<Value>
	{#snippet label()}
		{$i18n.core.name}
	{/snippet}

	<p>{segmentName}</p>
</Value>
