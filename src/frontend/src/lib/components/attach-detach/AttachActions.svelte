<script lang="ts">
	import AttachOrbiter from '$lib/components/attach-detach/AttachOrbiter.svelte';
	import AttachSatellite from '$lib/components/attach-detach/AttachSatellite.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<Actions direction="rtl" bind:visible>
	{#snippet icon()}
		<IconMore size="20px" />
	{/snippet}

	<AttachSatellite ondetach={close} />

	<AttachOrbiter ondetach={close} />
</Actions>
