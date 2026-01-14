<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Satellite } from '$lib/types/satellite';
	import type { Orbiter } from '$lib/types/orbiter';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Segment from '$lib/components/segments/Segment.svelte';
	import { isEmptyString, nonNullish } from '@dfinity/utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Option } from '$lib/types/utils';

	interface Props {
		label: Snippet;
		satellites: Satellite[];
		orbiter: Option<Orbiter>;
	}

	let { label, satellites, orbiter }: Props = $props();
</script>

<div class="card-container with-title from">
	<span class="title">{@render label()}</span>

	<ul class="content">
		{#each satellites as satellite (satellite.satellite_id.toText())}
			<li>
				<Segment id={satellite.satellite_id}>
					{satelliteName(satellite)}
				</Segment>
			</li>
		{/each}

		{#if nonNullish(orbiter)}
			{@const orbName = orbiterName(orbiter)}

			<li>
				<Segment id={orbiter.orbiter_id}>
					{isEmptyString(orbName) ? $i18n.analytics.orbiter : orbName}
				</Segment>
			</li>
		{/if}
	</ul>
</div>

<style lang="scss">
	ul {
		padding: var(--padding-0_25x) 0;
		margin: 0 var(--padding-2x);

	}

	li {
		margin: 0 0 var(--padding-0_5x);
	}
</style>