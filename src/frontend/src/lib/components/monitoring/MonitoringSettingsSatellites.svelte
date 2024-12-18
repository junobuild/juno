<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Value from '$lib/components/ui/Value.svelte';
	import { satellitesLoaded, satellitesStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		hasSatellitesMonitored: boolean;
	}

	let { hasSatellitesMonitored = $bindable(false) }: Props = $props();

	let satellitesMonitored = $state<Satellite[]>([]);
	let satellitesDisabled = $state<Satellite[]>([]);

	$effect(() => {
		const [satDisabled, satMonitored] = ($satellitesStore ?? []).reduce<[Satellite[], Satellite[]]>(
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
		);

		untrack(() => {
			satellitesDisabled = satDisabled;
			satellitesMonitored = satMonitored;
		});
	});

	$effect(() => {
		hasSatellitesMonitored = satellitesMonitored.length > 0;
	});
</script>

{#if $satellitesLoaded && ($satellitesStore ?? []).length > 0}
	<div in:fade>
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
	</div>
{/if}
