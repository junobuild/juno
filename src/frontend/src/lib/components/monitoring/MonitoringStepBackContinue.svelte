<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		header: Snippet;
		children: Snippet;
		onback: () => void;
		oncontinue: () => void;
		disabled?: boolean;
		grid?: boolean;
	}

	let { children, header, onback, oncontinue, disabled = false, grid = true }: Props = $props();
</script>

<form onsubmit={oncontinue}>
	{@render header()}

	<div class:grid>
		{@render children()}
	</div>

	<div class="toolbar">
		<button disabled={$isBusy} onclick={onback} type="button">
			{$i18n.core.back}
		</button>

		<button disabled={$isBusy || disabled}>
			{$i18n.core.continue}
		</button>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.grid {
		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}
</style>
