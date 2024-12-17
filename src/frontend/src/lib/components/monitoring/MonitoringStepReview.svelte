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
	<button type="button" disabled={$isBusy} onclick={onback}>{$i18n.core.back}</button>
	<button type="button" disabled={$isBusy} onclick={onsubmit}>
		{$i18n.core.apply}
	</button>
</div>
