<script lang="ts">
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';
	import IconVisibility from '$lib/components/icons/IconVisibility.svelte';

	interface Props {
		ariaLabel: string;
		icon: 'delete' | 'edit' | 'info' | 'visibility';
		onaction: (() => void) | (() => Promise<void>);
	}

	let { ariaLabel, icon, onaction }: Props = $props();

	const onclick = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		onaction();
	};
</script>

<button class="square" aria-label={ariaLabel} type="button" {onclick}
	>{#if icon === 'delete'}
		<IconDelete size="20px" />
	{:else if icon === 'info'}
		<IconInfo size="20px" />
	{:else if icon === 'visibility'}
		<IconVisibility size="20px" />
	{:else}
		<IconEdit size="20px" />
	{/if}</button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
