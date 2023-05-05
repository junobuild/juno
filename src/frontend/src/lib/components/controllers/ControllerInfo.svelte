<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';

	export let visible = false;

	const close = () => (visible = false);
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<p>{$i18n.controllers.no_delete}</p>

		<p>{$i18n.controllers.more_delete}</p>

		<button type="button" on:click|stopPropagation={close}>
			{$i18n.core.ok}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}
</style>
