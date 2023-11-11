<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { nonNullish } from '@dfinity/utils';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import MissionControlTopUp from '$lib/components/mission-control/MissionControlTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';
</script>

{#if $authSignedInStore}
	<div class="card-container">
		<Value>
			<svelte:fragment slot="label">{$i18n.mission_control.id}</svelte:fragment>
			<Identifier identifier={$missionControlStore?.toText() ?? ''} shorten={false} small={false} />
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
			<p>v{$versionStore?.missionControl?.current ?? '...'}</p>
		</Value>

		{#if nonNullish($missionControlStore)}
			<CanisterOverview canisterId={$missionControlStore} />
		{/if}
	</div>

	<MissionControlTopUp />
{/if}
