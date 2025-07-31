<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
		onyes: () => void;
		onno: () => void;
	}

	let { children, onyes, onno }: Props = $props();
</script>

{@render children()}

<div class="toolbar">
	<button disabled={$isBusy} onclick={onno} type="button">
		{$i18n.core.no}
	</button>

	<button disabled={$isBusy} onclick={onyes} type="button">
		{$i18n.core.yes}
	</button>
</div>
