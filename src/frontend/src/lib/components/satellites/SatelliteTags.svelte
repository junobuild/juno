<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteTags } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let tags = $derived(satelliteTags(satellite));
</script>

{#if nonNullish(tags)}
	<Value>
		{#snippet label()}
			{$i18n.satellites.tags}
		{/snippet}

		<p>
			{#each tags as tag (tag)}
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
