<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
</script>

<button class="icon" aria-label={$i18n.controllers.delete} type="button" on:click|stopPropagation
	><IconDelete /></button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
