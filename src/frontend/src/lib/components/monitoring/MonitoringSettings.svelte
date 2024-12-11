<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Value from '$lib/components/ui/Value.svelte';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import { emit } from '$lib/utils/events.utils';
	import MissionControlSettingsLoader from '$lib/components/mission-control/MissionControlSettingsLoader.svelte';
	import { missionControlSettingsLoaded } from '$lib/derived/mission-control.derived';
	import { isNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { missionControlSettingsDataStore } from '$lib/stores/mission-control.store';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	const openModal = () => {
		if (isNullish($missionControlSettingsDataStore)) {
			toasts.error({ text: $i18n.errors.mission_control_settings_not_loaded });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'monitoring_create_bulk_strategy',
				detail: {
					settings: $missionControlSettingsDataStore.data
				}
			}
		});
	};
</script>

<MissionControlSettingsLoader {missionControlId}>
	<div class="card-container with-title">
		<span class="title">{$i18n.core.settings}</span>

		<div class="content">
			<Value>
				{#snippet label()}
					Mission Control
				{/snippet}

				<p>Not monitored.</p>
			</Value>

			<Value>
				{#snippet label()}
					Satellites
				{/snippet}

				<p>5 monitored, 2 disabled.</p>
			</Value>

			<Value>
				{#snippet label()}
					Orbiter
				{/snippet}

				<p>Not monitored.</p>
			</Value>
		</div>
	</div>

	{#if $missionControlSettingsLoaded}
		<button in:fade onclick={openModal}>{$i18n.monitoring.create_strategy}</button>
	{/if}
</MissionControlSettingsLoader>
