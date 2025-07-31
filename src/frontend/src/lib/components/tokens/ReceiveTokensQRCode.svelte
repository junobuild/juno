<script lang="ts">
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import QRCodeContainer from '$lib/components/ui/QRCodeContainer.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		value: string;
		ariaLabel: string;
		back: () => void;
	}

	let { value, ariaLabel, back }: Props = $props();
</script>

<div class="container">
	<QRCodeContainer {ariaLabel} {value} />

	<div class="info">
		<Value>
			{#snippet label()}
				{ariaLabel}
			{/snippet}
			<Identifier identifier={value} shorten={true} small={false} />
		</Value>
	</div>

	<button onclick={back}>{$i18n.core.back}</button>
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
