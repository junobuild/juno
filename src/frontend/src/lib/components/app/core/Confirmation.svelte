<script lang="ts">
	import type { Snippet } from 'svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		visible?: boolean;
		title?: Snippet;
		children: Snippet;
		size?: 'default' | 'wide';
		onyes: () => Promise<void>;
		onno: () => void;
	}

	let {
		visible = $bindable(false),
		title,
		children,
		size = 'default',
		onyes,
		onno
	}: Props = $props();

	let center = $derived(size === 'wide' ? ('wide' as const) : true);
</script>

<Popover backdrop="dark" {center} bind:visible>
	<div class="content">
		<h3>{@render title?.()}</h3>

		{@render children()}

		<button disabled={$isBusy} onclick={onno} type="button">
			{$i18n.core.no}
		</button>

		<button disabled={$isBusy} onclick={onyes} type="button">
			{$i18n.core.yes}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
		max-width: 100%;
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}
</style>
