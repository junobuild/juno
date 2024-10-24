<script lang="ts">
	import { createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	interface Props {
		ariaLabel: string;
		icon: 'delete' | 'edit' | 'info';
	}

	let { ariaLabel, icon }: Props = $props();
</script>

<button
	class="square"
	aria-label={ariaLabel}
	type="button"
	onclick={stopPropagation(bubble('click'))}
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
