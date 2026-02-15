<script lang="ts">
	import Actions from '$lib/components/app/core/Actions.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import AttachOrbiter from '$lib/components/modules/attach-detach/AttachOrbiter.svelte';
	import AttachSatellite from '$lib/components/modules/attach-detach/AttachSatellite.svelte';

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
