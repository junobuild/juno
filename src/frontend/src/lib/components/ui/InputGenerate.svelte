<script lang="ts">
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';

	interface Props {
		inputPlaceholder: string;
		inputValue: string | undefined;
		generateLabel: string;
		generate: () => void;
	}

	let {
		inputPlaceholder,
		generateLabel,
		generate,
		inputValue = $bindable(undefined)
	}: Props = $props();
</script>

<div class="form-key">
	<input
		id="input-key"
		autocomplete="off"
		data-1p-ignore
		placeholder={inputPlaceholder}
		type="text"
		bind:value={inputValue}
	/>
	<button class="text" aria-label={generateLabel} onclick={generate} type="button">
		<IconAutoRenew size="20px" />
	</button>
</div>

<style lang="scss">
	.form-key {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);

		button {
			margin: var(--padding) 0 var(--padding-2x);
		}
	}
</style>
