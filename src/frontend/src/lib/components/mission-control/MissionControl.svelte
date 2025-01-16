<script lang="ts">
	import { fade } from 'svelte/transition';
	import CanisterMonitoring from '$lib/components/canister/CanisterMonitoring.svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import MissionControlActions from '$lib/components/mission-control/MissionControlActions.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import MonitoringDisabled from '$lib/components/monitoring/MonitoringDisabled.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import {
		missionControlMonitoring,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control-settings.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $authSignedIn}
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
						<p>v{$missionControlVersion?.current ?? '...'}</p>
					</Value>
				</div>
			</div>
		</div>

		<MissionControlActions {missionControlId} />
	</div>

	<div class="card-container with-title" in:fade>
		<span class="title">{$i18n.monitoring.title}</span>

		<div class="columns-3">
			<CanisterOverview canisterId={missionControlId} segment="mission_control" />

			<CanisterMonitoring canisterId={missionControlId} segment="mission_control">
				<MissionControlDataLoader {missionControlId}>
					<MonitoringDisabled
						monitoring={$missionControlMonitoring}
						loading={$missionControlSettingsNotLoaded}
					/>
				</MissionControlDataLoader>
			</CanisterMonitoring>
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
