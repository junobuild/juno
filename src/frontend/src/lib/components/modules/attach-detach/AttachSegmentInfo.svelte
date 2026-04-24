<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import DevId from '$lib/components/app/core/DevId.svelte';
	import MissionControlId from '$lib/components/mission-control/MissionControlId.svelte';
	import Hr from '$lib/components/ui/Hr.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
</script>

<div class="info">
	<Hr />

	<div class="dev-id">
		<DevId />
	</div>

	{#if nonNullish($missionControlId)}
		<div>
			<MissionControlId missionControlId={$missionControlId} />
		</div>
	{/if}

	<Hr />
</div>

<style lang="scss">
	.info {
		margin: var(--padding-2x) 0 0;
		font-size: var(--font-size-small);
	}

	.dev-id {
		padding: var(--padding-2x) 0 0;
	}
</style>
