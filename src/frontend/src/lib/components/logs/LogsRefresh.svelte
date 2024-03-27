<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Log as LogType } from '$lib/types/log';
	import { getContext } from 'svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';

	const { list, resetPage }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const reload = async () => {
		visible = false;

		resetPage();
		await list();
	};

	export let visible: boolean | undefined = undefined;

	let button: HTMLButtonElement | undefined;
</script>

<button
	class="icon"
	aria-label={$i18n.core.more}
	type="button"
	on:click={() => (visible = true)}
	bind:this={button}><IconMore size="20px" /></button
>

<Popover bind:visible anchor={button} direction="ltr">
	<div class="container">
		<button class="menu" type="button" on:click={reload}
			><IconAutoRenew size="20px" /> {$i18n.core.refresh}</button
		>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.icon {
		padding: 0;
	}
</style>
