<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import MissionControlActions from '$lib/components/mission-control/MissionControlActions.svelte';
	import MissionControlSettingsLoader from '$lib/components/mission-control/MissionControlSettingsLoader.svelte';
	import MissionControlStatuses from '$lib/components/mission-control/MissionControlStatuses.svelte';
	import Monitoring from '$lib/components/monitoring/Monitoring.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlMonitoring,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $authSignedInStore}
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-3 fit-column-1">
			<div class="id">
				<div>
					<Value>
						{#snippet label()}
							{$i18n.mission_control.id}
						{/snippet}
						<Identifier identifier={missionControlId.toText()} shorten={false} small={false} />
					</Value>
				</div>

				<CanisterSubnet canisterId={missionControlId} />
			</div>

			<div>
				<div>
					<Value>
						{#snippet label()}
							{$i18n.core.version}
						{/snippet}
						<p>v{$versionStore?.missionControl?.current ?? '...'}</p>
					</Value>
				</div>

				<div>
					<MissionControlSettingsLoader {missionControlId}>
						<Monitoring
							monitoring={$missionControlMonitoring}
							loading={$missionControlSettingsNotLoaded}
						/>
					</MissionControlSettingsLoader>
				</div>
			</div>
		</div>

		<MissionControlActions {missionControlId} />
	</div>

	<div class="card-container with-title" in:fade>
		<span class="title">{$i18n.canisters.insight}</span>

		<div class="columns-3">
			<CanisterOverview canisterId={missionControlId} segment="mission_control" />

			<MissionControlStatuses {missionControlId} />
		</div>
	</div>
{/if}

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
