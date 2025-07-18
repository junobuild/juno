<script lang="ts">
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import type { CanisterData } from '$lib/types/canister';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';

	interface Props {
		cyclesWarning: boolean;
		heapWarning: boolean;
		data: CanisterData | undefined;
		close: () => void;
	}

	let { cyclesWarning, heapWarning, close, data }: Props = $props();
</script>

{#if !cyclesWarning}
	<Notification href="/mission-control" {close}>
		{#snippet icon()}
			<IconMissionControl size="32px" />
		{/snippet}

		{#snippet badge()}
			<CanisterIndicator {data} />
		{/snippet}

		Your Mission Control requires action: Low cycles detected.
	</Notification>
{/if}

{#if !heapWarning}
	<Notification href="/mission-control" {close}>
		{#snippet icon()}
			<IconWarning size="32px" />
		{/snippet}

		Your Mission Control requires action: Heap memory is approaching 1 GB
	</Notification>
{/if}
