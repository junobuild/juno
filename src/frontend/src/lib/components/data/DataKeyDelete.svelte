<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import DataDelete from '$lib/components/data/DataDelete.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
		title?: Snippet;
		children: Snippet;
	}

	let { deleteData, title, children }: Props = $props();
</script>

<DataDelete {deleteData} {title}>
	{#snippet button()}
		{$i18n.core.delete}
	{/snippet}

	<Value>
		{#snippet label()}
			{$i18n.collections.key}
		{/snippet}
		<p>{@render children()}</p>
	</Value>
</DataDelete>

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		@include text.truncate;
	}
</style>
