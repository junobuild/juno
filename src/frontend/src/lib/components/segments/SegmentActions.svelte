<script lang="ts">
	import type { Snippet } from 'svelte';
	import Actions from '$lib/components/core/Actions.svelte';

	interface Props {
		visible?: boolean | undefined;
		mainActions?: Snippet;
		moreActions: Snippet;
	}

	let { visible = $bindable(false), moreActions, mainActions }: Props = $props();
</script>

<div class="toolbar" role="toolbar">
	{@render mainActions?.()}

	<Actions bind:visible>
		{@render moreActions()}
	</Actions>
</div>

<style lang="scss">
	.toolbar {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);

		margin: calc(-1 * var(--padding)) 0 var(--padding-8x);
	}
</style>
