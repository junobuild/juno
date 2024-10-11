<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { nonNullish } from '@dfinity/utils';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import MissionControlActions from '$lib/components/mission-control/MissionControlActions.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import { fade } from 'svelte/transition';
	import MissionControlStatuses from '$lib/components/mission-control/MissionControlStatuses.svelte';
</script>

{#if $authSignedInStore}
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-3 fit-column-1">
			<div class="id">
				<Value>
					<svelte:fragment slot="label">{$i18n.mission_control.id}</svelte:fragment>
					<Identifier
						identifier={$missionControlStore?.toText() ?? ''}
						shorten={false}
						small={false}
					/>
				</Value>
			</div>

			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
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
