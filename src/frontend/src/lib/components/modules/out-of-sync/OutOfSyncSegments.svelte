<script lang="ts">
	import { isEmptyString, nonNullish } from '@dfinity/utils';
	import type { Nullish } from '@dfinity/zod-schemas';
	import type { Snippet } from 'svelte';
	import Segment from '$lib/components/modules/segments/Segment.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Orbiter } from '$lib/types/orbiter';
	import type { Satellite } from '$lib/types/satellite';
	import type { Ufo } from '$lib/types/ufo';
	import { metadataUiName } from '$lib/utils/metadata-ui.utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';

	interface Props {
		label: Snippet;
		satellites: Satellite[];
		ufos: Ufo[];
		orbiter: Nullish<Orbiter>;
	}

	let { label, satellites, ufos, orbiter }: Props = $props();
</script>

{#snippet withSegments()}
	<ul class="content">
		{#if nonNullish(orbiter)}
			{@const orbName = orbiterName(orbiter)}

			<li>
				<Segment id={orbiter.orbiter_id}>
					{isEmptyString(orbName) ? $i18n.analytics.orbiter : orbName}
				</Segment>
			</li>
		{/if}

		{#each satellites as satellite (satellite.satellite_id.toText())}
			<li>
				<Segment id={satellite.satellite_id}>
					{metadataUiName(satellite)}
				</Segment>
			</li>
		{/each}

		{#each ufos as ufo (ufo.ufo_id.toText())}
			<li>
				<Segment id={ufo.ufo_id}>
					{metadataUiName(ufo)}
				</Segment>
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet withoutSegments()}
	<p>{$i18n.out_of_sync.no_segments}</p>
{/snippet}

<div class="card-container with-title from">
	<span class="title">{@render label()}</span>

	{#if satellites.length > 0 || nonNullish(orbiter)}
		{@render withSegments()}
	{:else}
		{@render withoutSegments()}
	{/if}
</div>

<style lang="scss">
	ul,
	p {
		margin: 0 var(--padding-2x);
	}

	p {
		padding: var(--padding-2x) 0;
	}

	li {
		margin: 0 0 var(--padding-0_5x);
	}
</style>
