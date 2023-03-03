<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconSort from '$lib/components/icons/IconSort.svelte';
</script>

<div class="container">
	<span><slot /></span>

	<button class="icon" aria-label={$i18n.data.sort} type="button" on:click
		><IconSort size="20px" /></button
	>
</div>

<style lang="scss">
	.container {
		display: flex;
		justify-content: space-between;
	}

	button {
		padding: 0;
	}
</style>
