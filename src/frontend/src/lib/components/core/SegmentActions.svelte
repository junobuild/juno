<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Segment } from '$lib/types/canister';
	import Actions from '$lib/components/core/Actions.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		visible?: boolean | undefined;
		cycleActions: Snippet;
		canisterActions: Snippet;
		segment: Segment;
	}

	let { visible = $bindable(false), cycleActions, canisterActions, segment }: Props = $props();
</script>

<Actions bind:visible>
	<p>{$i18n.canisters.cycles}:</p>

	{@render cycleActions()}

	<p>{segment.replace('_', ' ')}:</p>

	{@render canisterActions()}
</Actions>

<style lang="scss">
	p {
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-bold);
		padding: var(--padding) var(--padding) var(--padding-0_5x);
		margin: 0;
		text-transform: capitalize;

		&:not(:first-of-type) {
			padding: var(--padding-3x) var(--padding) var(--padding-0_5x);
		}
	}
</style>
