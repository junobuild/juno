<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import MissionControlSettingsLoader from '$lib/components/mission-control/MissionControlSettingsLoader.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlSettings,
		missionControlSettingsLoaded,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlSettingsDataStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { emit } from '$lib/utils/events.utils';
	import { satellitesStore } from '$lib/derived/satellite.derived';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { cy } from 'date-fns/locale';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { onMount } from 'svelte';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { loadSatellites } from '$lib/services/satellites.services';

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
					settings: $missionControlSettingsDataStore.data,
					missionControlId
				}
			}
		});
	};

	let [satellitesDisabled, satellitesMonitored] = $derived(
		($satellitesStore ?? []).reduce<[Satellite[], Satellite[]]>(
			([disabled, monitored], satellite) => {
				const cycles = fromNullable(
					fromNullable(fromNullable(satellite.settings)?.monitoring ?? [])?.cycles ?? []
				);

				return [
					[...disabled, ...(cycles?.enabled !== true ? [satellite] : [])],
					[...monitored, ...(cycles?.enabled === true ? [satellite] : [])]
				];
			},
			[[], []]
		)
	);

	let orbiterMonitored = $derived(
		fromNullable(
			fromNullable(fromNullable($orbiterStore?.settings ?? [])?.monitoring ?? [])?.cycles ?? []
		)?.enabled === true
	);

	onMount(async () => await loadOrbiters({ missionControl: missionControlId }));
</script>

<MissionControlSettingsLoader {missionControlId}>
	<div class="card-container with-title">
		<span class="title">{$i18n.core.settings}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<Value>
					{#snippet label()}
						{$i18n.mission_control.title}
					{/snippet}

					{#if $missionControlSettingsNotLoaded}
						<p><SkeletonText /></p>
					{:else}
						<p>
							{nonNullish($missionControlSettings)
								? $i18n.monitoring.monitored
								: $i18n.monitoring.not_monitored}
						</p>
					{/if}
				</Value>

				<Value>
					{#snippet label()}
						{$i18n.satellites.title}
					{/snippet}

					<p>
						{satellitesMonitored.length === 0
							? $i18n.monitoring.not_monitored
							: satellitesMonitored.length > 0 && satellitesDisabled.length > 0
								? i18nFormat($i18n.monitoring.modules_monitored_and_disabled, [
										{
											placeholder: '{0}',
											value: `${satellitesMonitored.length}`
										},
										{
											placeholder: '{1}',
											value: `${satellitesDisabled.length}`
										}
									])
								: i18nFormat($i18n.monitoring.modules_monitored, [
										{
											placeholder: '{0}',
											value: `${satellitesMonitored.length}`
										}
									])}
					</p>
				</Value>

				<Value>
					{#snippet label()}
						{$i18n.analytics.orbiter}
					{/snippet}

					<p>
						{orbiterMonitored ? $i18n.monitoring.monitored : $i18n.monitoring.not_monitored}
					</p>
				</Value>
			</div>
		</div>
	</div>

	{#if $missionControlSettingsLoaded}
		<button in:fade onclick={openModal}>{$i18n.monitoring.create_strategy}</button>
	{/if}
</MissionControlSettingsLoader>
