<script lang="ts">
	import AttachOrbiter from '$lib/components/attach-detach/AttachOrbiter.svelte';
	import AttachSatellite from '$lib/components/attach-detach/AttachSatellite.svelte';
	import Actions from '$lib/components/core/Actions.svelte';

	let visible: boolean = $state(false);
	const close = () => (visible = false);
</script>

<Actions bind:visible direction="rtl">
	<AttachSatellite ondetach={close} />

	<AttachOrbiter ondetach={close} />
</Actions>
