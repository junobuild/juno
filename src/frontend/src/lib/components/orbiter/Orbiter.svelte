<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterMonitoring from '$lib/components/canister/CanisterMonitoring.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import MonitoringDisabled from '$lib/components/monitoring/MonitoringDisabled.svelte';
	import OrbiterActions from '$lib/components/orbiter/OrbiterActions.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

	let monitoring = $derived(fromNullishNullable(fromNullishNullable(orbiter.settings)?.monitoring));
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3 fit-column-1">
		<div class="id">
			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.id}
					{/snippet}
					<Identifier identifier={orbiter.orbiter_id.toText()} shorten={false} small={false} />
				</Value>
			</div>

			<CanisterSubnet canisterId={orbiter.orbiter_id} />
		</div>

		<div>
			<div>
				<Value>
					{#snippet label()}
						{$i18n.core.version}
					{/snippet}
					<p>v{$versionStore?.orbiter?.current ?? '...'}</p>
				</Value>
			</div>
		</div>
	</div>

	<OrbiterActions {orbiter} />
</div>

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.title}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={orbiter.orbiter_id}
			segment="orbiter"
			heapWarningLabel={$i18n.canisters.warning_orbiter_heap_memory}
		/>

		<CanisterMonitoring canisterId={orbiter.orbiter_id}>
			<MonitoringDisabled {monitoring} loading={$orbiterNotLoaded} />
		</CanisterMonitoring>
	</div>
</div>

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
