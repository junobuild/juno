<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import QRCodeContainer from '$lib/components/ui/QRCodeContainer.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		value: string;
		ariaLabel: string;
	}

	let { value, ariaLabel }: Props = $props();

	const dispatch = createEventDispatcher();
</script>

<div class="container">
	<QRCodeContainer {value} {ariaLabel} />

	<div class="info">
		<Value>
			{#snippet label()}
				{ariaLabel}
			{/snippet}
			<Identifier shorten={true} small={false} identifier={value} />
		</Value>
	</div>

	<button onclick={() => dispatch('junoBack')}>{$i18n.core.back}</button>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;

		padding: var(--padding) 0 0;
	}

	.info {
		padding: var(--padding-4x) 0 0;
	}
</style>
