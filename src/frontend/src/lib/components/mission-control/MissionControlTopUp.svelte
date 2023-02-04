<script lang="ts">
	import { emit } from '$lib/utils/events.utils';
</script>

<button
	role="button"
	on:click={() => emit({ message: 'junoModal', detail: { type: 'topup_mission_control' } })}
	>Top-up</button
>

<style lang="scss">
	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
