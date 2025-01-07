<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
		onback: () => void;
		oncontinue: () => void;
		disabled?: boolean;
	}

	let { children, onback, oncontinue, disabled = false }: Props = $props();
</script>

<form onsubmit={oncontinue}>
	{@render children()}

	<div class="toolbar">
		<button type="button" onclick={onback} disabled={$isBusy}>
			{$i18n.core.back}
		</button>

		<button disabled={$isBusy || disabled}>
			{$i18n.core.continue}
		</button>
	</div>
</form>
