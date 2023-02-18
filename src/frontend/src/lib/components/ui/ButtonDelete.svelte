<script lang="ts">
	import IconDelete from '$lib/components/icons/IconDelete.svelte';

	export let ariaLabel: string;
</script>

<button class="icon" aria-label={ariaLabel} type="button" on:click|stopPropagation
	><IconDelete size="20px" /></button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
