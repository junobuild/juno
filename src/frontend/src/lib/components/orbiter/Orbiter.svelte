<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import OrbiterActions from '$lib/components/orbiter/OrbiterActions.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';

	export let orbiter: Orbiter;
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3 fit-column-1">
		<div class="id">
			<Value>
				<svelte:fragment slot="label">{$i18n.analytics.id}</svelte:fragment>
				<Identifier identifier={orbiter.orbiter_id.toText()} shorten={false} small={false} />
			</Value>

			<CanisterSubnet canisterId={orbiter.orbiter_id} />
		</div>

		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
				<p>v{$versionStore?.orbiter?.current ?? '...'}</p>
			</Value>
		</div>
	</div>

	<OrbiterActions {orbiter} />
</div>

<div class="card-container with-title">
	<span class="title">{$i18n.canisters.insight}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={orbiter.orbiter_id}
			segment="orbiter"
			heapWarningLabel={$i18n.canisters.warning_orbiter_heap_memory}
		/>

		<CanisterJunoStatuses segment="orbiter" canisterId={orbiter.orbiter_id} />
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
