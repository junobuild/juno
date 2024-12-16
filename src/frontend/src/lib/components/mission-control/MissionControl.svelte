<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import MissionControlActions from '$lib/components/mission-control/MissionControlActions.svelte';
	import MissionControlStatuses from '$lib/components/mission-control/MissionControlStatuses.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
</script>

{#if $authSignedIn}
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-3 fit-column-1">
			<div class="id">
				<Value>
					{#snippet label()}
						{$i18n.mission_control.id}
					{/snippet}
					<Identifier
						identifier={$missionControlStore?.toText() ?? ''}
						shorten={false}
						small={false}
					/>
				</Value>

				{#if nonNullish($missionControlStore)}
					<CanisterSubnet canisterId={$missionControlStore} />
				{/if}
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.core.version}
					{/snippet}
					<p>v{$versionStore?.missionControl?.current ?? '...'}</p>
				</Value>
			</div>
		</div>

		{#if nonNullish($missionControlStore)}
			<MissionControlActions missionControlId={$missionControlStore} />
		{/if}
	</div>

	{#if nonNullish($missionControlStore)}
		<div class="card-container with-title" in:fade>
			<span class="title">{$i18n.canisters.insight}</span>

			<div class="columns-3">
				<CanisterOverview canisterId={$missionControlStore} segment="mission_control" />

				<MissionControlStatuses missionControlId={$missionControlStore} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
