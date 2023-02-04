<script lang="ts">
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import type { Doc } from '$declarations/satellite/satellite.did';
	import { getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '$lib/utils/utils';
	import { fromArray } from '$lib/utils/did.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { formatToDate } from '$lib/utils/date.utils';
	import Json from '$lib/components/ui/Json.svelte';

	const { store }: DataContext<Doc> = getContext<DataContext<Doc>>(DATA_CONTEXT_KEY);

	let key: string | undefined;
	$: key = $store?.key;
	let doc: Doc | undefined;
	$: doc = $store?.data;

	let owner: Principal | undefined;
	$: owner = doc?.owner;

	let obj: unknown | undefined = undefined;
	$: (async () =>
		(obj = nonNullish(doc) && nonNullish(doc?.data) ? await fromArray(doc.data) : undefined))();
</script>

<p class="title doc">{key ?? ''}</p>

{#if nonNullish(doc)}
	<article class="doc">
		<div class="owner">
			<label>Owner:</label>
			{#if nonNullish(owner)}
				<Identifier identifier={owner.toText()} />
			{/if}
		</div>

		<div class="date">
			<label>Created:</label>
			<span>{formatToDate(doc.created_at)}</span>
		</div>

		<div class="date">
			<label>Updated:</label>
			<span>{formatToDate(doc.updated_at)}</span>
		</div>

		<div class="data">
			<label>Data:</label>
			<div class="json"><Json json={obj} /></div>
		</div>
	</article>
{/if}

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/media';

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

		padding: var(--padding-0_5x) var(--padding-2x);
	}

	.owner {
		padding: 0 0 var(--padding);
	}

	.data,
	.date {
		padding: 0 0 var(--padding-2x);
	}

	.json {
		padding: var(--padding-2x) 0;
	}
</style>
