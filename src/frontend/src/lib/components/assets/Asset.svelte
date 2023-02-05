<script lang="ts">
	import type { DataContext } from '$lib/types/data.context';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import { DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import { getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { fromNullable } from '$lib/utils/did.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { formatToDate } from '$lib/utils/date.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	const { store }: DataContext<AssetNoContent> =
		getContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY);

	let key: string | undefined;
	$: key = $store?.key;
	let asset: AssetNoContent | undefined;
	$: asset = $store?.data;

	let owner: Principal | undefined;
	$: owner = asset?.key.owner;

	let token: string | undefined;
	$: token = asset ? fromNullable(asset.key.token) : undefined;

	let headers: [string, string][];
	$: headers = asset?.headers ?? [];
</script>

<p class="title doc">{key ?? ''}</p>

{#if nonNullish(asset)}
	<article class="doc">
		<div class="owner">
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.owner}</svelte:fragment>
				<Identifier identifier={owner?.toText() ?? ''} />
			</Value>
		</div>

		{#if nonNullish(token)}
			<div class="data">
				<Value>
					<svelte:fragment slot="label">{$i18n.asset.token}</svelte:fragment>
					{token}
				</Value>
			</div>
		{/if}

		<div class="headers">
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.headers}</svelte:fragment>
				{#each headers as header}
					<span>{header[0]}: {header[1]}</span>
				{/each}
			</Value>
		</div>

		<div class="date">
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.created}</svelte:fragment>
				{formatToDate(asset.created_at)}
			</Value>
		</div>

		<div class="date">
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.updated}</svelte:fragment>
				{formatToDate(asset.updated_at)}
			</Value>
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
	.date,
	.headers {
		padding: 0 0 var(--padding-2x);
	}

	.headers {
		display: flex;
		flex-direction: column;

		span {
			padding: var(--padding) 0 0 var(--padding-4x);
		}
	}
</style>
