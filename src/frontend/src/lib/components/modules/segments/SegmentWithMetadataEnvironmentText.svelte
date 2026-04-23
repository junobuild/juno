<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SegmentWithMetadata } from '$lib/types/segment';
	import { metadataUiEnvironment } from '$lib/utils/metadata-ui.utils';

	interface Props {
		segment: SegmentWithMetadata;
	}

	let { segment }: Props = $props();

	let env = $derived(metadataUiEnvironment(segment));
</script>

{#if nonNullish(env)}
	<Value>
		{#snippet label()}
			{$i18n.core.environment}
		{/snippet}

		<p>{env}</p>
	</Value>
{/if}

<style lang="scss">
	p {
		&::first-letter {
			text-transform: uppercase;
		}
	}
</style>
