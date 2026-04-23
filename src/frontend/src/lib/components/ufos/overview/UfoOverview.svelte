<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import CanisterSyncData from '$lib/components/modules/canister/CanisterSyncData.svelte';
	import CanisterOverview from '$lib/components/modules/canister/display/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/modules/canister/display/CanisterSubnet.svelte';
	import SegmentWithMetadataEnvironmentText from '$lib/components/modules/segments/SegmentWithMetadataEnvironmentText.svelte';
	import SegmentWithMetadataName from '$lib/components/modules/segments/SegmentWithMetadataName.svelte';
	import SegmentWithMetadataTags from '$lib/components/modules/segments/SegmentWithMetadataTags.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
	}

	let { ufo }: Props = $props();

	let monitoring = $derived(
		'settings' in ufo
			? fromNullishNullable(fromNullishNullable(ufo.settings)?.monitoring)
			: undefined
	);

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let ufoId = $derived(ufo.ufo_id.toText());

	let canister = $state<CanisterSyncDataType | undefined>(undefined);
</script>

<CanisterSyncData canisterId={ufo.ufo_id} bind:canister />

<div class="overview">
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-3 fit-column-1">
			<div class="id">
				<SegmentWithMetadataName segment={ufo} />

				<SegmentWithMetadataEnvironmentText segment={ufo} />

				<SegmentWithMetadataTags segment={ufo} />
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.ufo.id}
					{/snippet}
					<Identifier identifier={ufoId} shorten={false} small={false} />
				</Value>

				<CanisterSubnet canisterId={ufo.ufo_id} />
			</div>
		</div>
	</div>

	<div class="actions">TODO</div>
</div>

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.runtime}</span>

	<div class="columns-3">
		<CanisterOverview canisterId={ufo.ufo_id} segment="ufo" />
	</div>
</div>

TODO

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
