<script lang="ts">
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';

	let visible: boolean | undefined;
	const close = () => (visible = false);
</script>

<Actions bind:visible>
	<TopUp type="topup_mission_control" on:junoTopUp={close} />
</Actions>
