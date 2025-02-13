<script lang="ts">
	import IconBlock from '$lib/components/icons/IconBlock.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	interface Props {
		ariaLabel: string;
		icon: 'delete' | 'edit' | 'info' | 'block' | 'check';
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
	{:else if icon === 'block'}
		<IconBlock size="20px" />
	{:else if icon === 'check'}
		<IconCheckCircle size="20px" />
	{:else}
		<IconEdit size="20px" />
	{/if}</button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
