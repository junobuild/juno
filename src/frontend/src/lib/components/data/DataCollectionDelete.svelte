<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import DataDelete from '$lib/components/data/DataDelete.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Snippet } from 'svelte';

	interface Props {
		deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
		button?: Snippet;
		title?: Snippet;
		children?: Snippet;
	}

	let { deleteData, button, title, children }: Props = $props();
</script>

<DataDelete {deleteData}>
	{#snippet button()}
		{@render button?.()}
	{/snippet}
	{#snippet title()}
		{@render title?.()}
	{/snippet}

	<p>{@render children?.()}</p>

	<p>{$i18n.core.are_you_sure}</p>
</DataDelete>

<style lang="scss">
	p {
		white-space: initial;
		word-break: break-word;
	}
</style>
