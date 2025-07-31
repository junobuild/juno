<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	let { children, onback, onsubmit }: Props = $props();
</script>

{@render children()}

<div class="toolbar">
	<button disabled={$isBusy} onclick={onback} type="button">{$i18n.core.back}</button>
	<button disabled={$isBusy} onclick={onsubmit} type="button">
		{$i18n.core.apply}
	</button>
</div>
