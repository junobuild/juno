<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { fromArray } from '@junobuild/utils';
	import { getContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import type { SatelliteDid } from '$declarations';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import JsonCode from '$lib/components/ui/JsonCode.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import { formatToDate } from '$lib/utils/date.utils';

	const { store }: DataContext<SatelliteDid.Doc> =
		getContext<DataContext<SatelliteDid.Doc>>(DATA_CONTEXT_KEY);

	let key: string | undefined = $derived($store?.key);

	let doc = $state<SatelliteDid.Doc | undefined>(undefined);
	run(() => {
		doc = $store?.data;
	});

	let owner: Principal | undefined = $derived(doc?.owner);

	let description: string | undefined = $derived(
		nonNullish(doc) ? fromNullable(doc.description) : undefined
	);

	let version: bigint | undefined = $derived(fromNullishNullable(doc?.version));

	let obj: unknown | undefined = $state(undefined);
	run(() => {
		(async () =>
			(obj = nonNullish(doc) && nonNullish(doc?.data) ? await fromArray(doc.data) : undefined))();
	});
</script>

{#if nonNullish(doc)}
	<p class="title doc">{key ?? ''}</p>

	<article class="doc">
		<div class="owner">
			<Value>
				{#snippet label()}
					{$i18n.document.owner}
				{/snippet}
				{#if nonNullish(owner)}
					<Identifier identifier={owner.toText()} />
				{/if}
			</Value>
		</div>

		{#if nonNullish(description)}
			<Value>
				{#snippet label()}
					{$i18n.document.description}
				{/snippet}
				<p class="description">{description}</p>
			</Value>
		{/if}

		<div class="date">
			<Value>
				{#snippet label()}
					{$i18n.core.created}
				{/snippet}
				{formatToDate(doc.created_at)}
			</Value>
		</div>

		<div class="date">
			<Value>
				{#snippet label()}
					{$i18n.core.updated}
				{/snippet}
				{formatToDate(doc.updated_at)}
			</Value>
		</div>

		{#if nonNullish(version)}
			<div class="version">
				<Value>
					{#snippet label()}
						{$i18n.document.version}
					{/snippet}
					{version}
				</Value>
			</div>
		{/if}

		<div class="data">
			<Value>
				{#snippet label()}
					{$i18n.document.data}
				{/snippet}
				<div class="json"><JsonCode json={obj} /></div>
			</Value>
		</div>
	</article>
{/if}

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/text';

	.title {
		@include collections.title;
	}

	.doc {
		grid-column: span 4;

		@include media.min-width(large) {
			grid-column-start: 3;
			grid-column-end: 5;
		}
	}

	article {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x) var(--padding-2x) 0;
	}

	.owner {
		padding: 0 0 var(--padding);
	}

	.data,
	.date,
	.version {
		padding: 0 0 var(--padding-2x);
	}

	.json {
		padding: var(--padding-2x) 0;
	}

	.description {
		@include text.clamp(5);
	}
</style>
