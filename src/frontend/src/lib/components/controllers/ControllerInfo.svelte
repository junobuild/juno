<script lang="ts">
	import { stopPropagation } from 'svelte/legacy';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		visible?: boolean;
	}

	let { visible = $bindable(false) }: Props = $props();

	const close = () => (visible = false);
</script>

<Popover backdrop="dark" center={true} bind:visible>
	<div class="content">
		<p>{$i18n.controllers.no_delete}</p>

		<p>{$i18n.controllers.more_delete}</p>

		<button onclick={stopPropagation(close)} type="button">
			{$i18n.core.ok}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}
</style>
