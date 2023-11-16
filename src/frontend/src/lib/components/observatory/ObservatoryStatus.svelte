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
			{data.id.toText()}
		</td>
		<td>
			{formatTCycles(data.status.cycles)}
		</td>
	{/if}
</tr>
