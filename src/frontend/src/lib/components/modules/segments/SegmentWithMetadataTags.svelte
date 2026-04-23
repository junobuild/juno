<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SegmentWithMetadata } from '$lib/types/segment';
	import { metadataUiTags } from '$lib/utils/metadata-ui.utils';

	interface Props {
		segment: SegmentWithMetadata;
	}

	let { segment }: Props = $props();

	let tags = $derived(metadataUiTags(segment));
</script>

{#if nonNullish(tags)}
	<Value>
		{#snippet label()}
			{$i18n.core.tags}
		{/snippet}

		<p>
			{#each tags as tag, index (`${tag}-${index}`)}
				<Badge color="primary-opaque">{tag}</Badge>
			{/each}
		</p>
	</Value>
{/if}

<style lang="scss">
	p {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--padding);

		padding: var(--padding-0_5x) 0 0;
	}
</style>
