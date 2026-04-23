<script lang="ts">
	import CanisterStopStart from '$lib/components/modules/canister/lifecycle/CanisterStopStart.svelte';
	import TopUp from '$lib/components/modules/canister/top-up/TopUp.svelte';
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
		canister: CanisterSyncDataType | undefined;
		monitoringEnabled: boolean;
	}

	let { ufo, canister, monitoringEnabled }: Props = $props();

	let detail = $derived({ ufo });

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<TopUp {detail} onclose={close} type="topup_ufo" />
	{/snippet}

	{#snippet lifecycleActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			onstart={close}
			onstop={close}
			segment="ufo"
		/>
	{/snippet}
</SegmentActions>
