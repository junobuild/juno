<script lang="ts">
	import ObservatoryError from '$lib/components/observatory/ObservatoryError.svelte';
	import type { Status } from '$lib/types/observatory';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		status: Status;
		segment: 'Mission control' | 'Satellite' | 'Orbiter';
	}

	let { status, segment }: Props = $props();
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
