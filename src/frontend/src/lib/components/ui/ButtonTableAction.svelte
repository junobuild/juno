<script lang="ts">
	import IconBlock from '$lib/components/icons/IconBlock.svelte';
	import IconCheck from '$lib/components/icons/IconCheck.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import IconInfoText from '$lib/components/icons/IconInfoText.svelte';

	interface Props {
		ariaLabel: string;
		icon: 'delete' | 'edit' | 'info' | 'block' | 'check';
		errorStyle?: boolean;
		onaction: (() => void) | (() => Promise<void>);
	}

	let { ariaLabel, icon, onaction, errorStyle }: Props = $props();

	const onclick = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		onaction();
	};
</script>

<button class="square" class:error={errorStyle} aria-label={ariaLabel} {onclick} type="button"
	>{#if icon === 'delete'}
		<IconDelete size="20px" />
	{:else if icon === 'info'}
		<IconInfoText size="20px" />
	{:else if icon === 'block'}
		<IconBlock size="20px" />
	{:else if icon === 'check'}
		<IconCheck size="20px" />
	{:else}
		<IconEdit size="20px" />
	{/if}</button
>

<style lang="scss">
	button {
		vertical-align: middle;
	}
</style>
