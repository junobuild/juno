<script lang="ts">
	import type { Status } from '$lib/types/observatory';
	import ObservatoryError from '$lib/components/observatory/ObservatoryError.svelte';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	export let status: Status;
	export let segment: 'Mission control' | 'Satellite' | 'Orbiter';
</script>

<tr>
	{#if 'Err' in status}
		<td colspan="3">
			<ObservatoryError err={status.Err} />
		</td>
	{:else}
		{@const data = status.Ok}

		<td>
			{segment}
		</td>
		<td>
			{#if segment === 'Mission control'}
				<a href="/mission-control">{data.id.toText()}</a>
			{:else if segment === 'Satellite'}
				{@const satelliteId = data.id.toText()}
				<a href={`/satellite/?s=${satelliteId}`}>{satelliteId}</a>
			{:else}
				<a href="/analytics">{data.id.toText()}</a>
			{/if}
		</td>
		<td>
			{formatTCycles(data.status.cycles)}
		</td>
	{/if}
</tr>
