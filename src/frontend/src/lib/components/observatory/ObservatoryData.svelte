<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import ObservatoryError from '$lib/components/observatory/ObservatoryError.svelte';
	import ObservatoryStatus from '$lib/components/observatory/ObservatoryStatus.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Status, Statuses } from '$lib/types/observatory';

	interface Props {
		statuses: Statuses;
	}

	let { statuses }: Props = $props();

	let orbiters: Status[] = $derived(
		nonNullish(statuses) && 'Ok' in statuses ? (fromNullable(statuses.Ok.orbiters) ?? []) : []
	);

	let satellites: Status[] = $derived(
		nonNullish(statuses) && 'Ok' in statuses ? (fromNullable(statuses.Ok.satellites) ?? []) : []
	);
</script>

{#if 'Err' in statuses}
	<div class="card-container">
		<ObservatoryError err={statuses.Err} />
	</div>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>{$i18n.observatory.segment}</th>
					<th>{$i18n.observatory.id}</th>
					<th class="status">{$i18n.observatory.cycles_collected}</th>
				</tr>
			</thead>

			<tbody>
				<ObservatoryStatus status={statuses.Ok.mission_control} segment="Mission control" />

				{#each orbiters as orbiter}
					<ObservatoryStatus status={orbiter} segment="Orbiter" />
				{/each}

				{#each satellites as satellite}
					<ObservatoryStatus status={satellite} segment="Satellite" />
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.card-container {
		margin: var(--padding-4x) 0 0;
	}

	.table-container {
		margin: var(--padding-6x) 0 0;
	}
</style>
