<script lang="ts">
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		takeSnapshot: boolean;
	}

	let { takeSnapshot = $bindable(true) }: Props = $props();
</script>

<div class="container">
	<Collapsible>
		<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

		<div class="options">
			<input
				type="checkbox"
				checked={takeSnapshot}
				onchange={() => (takeSnapshot = !takeSnapshot)}
			/>
			<span>{$i18n.canisters.snapshot_before_upgrade}</span>
		</div>
	</Collapsible>
</div>

<style lang="scss">
	input[type='checkbox'] {
		margin: 0;
	}

	.options {
		margin: var(--padding) var(--padding-0_5x) 0;
	}

	.container {
		margin: var(--padding-2x) 0 var(--padding-4x);
	}
</style>
