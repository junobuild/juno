<script lang="ts">
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	export let ariaLabel: string;
	export let icon: 'delete' | 'edit' | 'info';
</script>

<button class="square" aria-label={ariaLabel} type="button" on:click|stopPropagation
	>{#if icon === 'delete'}
		<IconDelete size="20px" />
	{:else if icon === 'info'}
		<IconInfo size="20px" />
	{:else}
		<IconEdit size="20px" />
	{/if}</button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
