<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { createEventDispatcher } from 'svelte';

	export let visible = false;

	const dispatch = createEventDispatcher();
	const yes = () => dispatch('junoYes');
	const no = () => dispatch('junoNo');
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3><slot name="title" /></h3>

		<slot />

		<button type="button" on:click|stopPropagation={no} disabled={$isBusy}>
			{$i18n.core.no}
		</button>

		<button type="button" on:click|stopPropagation={yes} disabled={$isBusy}>
			{$i18n.core.yes}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}
</style>
