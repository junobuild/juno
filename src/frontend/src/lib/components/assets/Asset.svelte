<script lang="ts">
	import type { DataContext } from '$lib/types/data.context';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import { DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import { getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { fromNullable } from '$lib/utils/did.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { formatToDate } from '$lib/utils/date.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataToolbar from '$lib/components/data/DataToolbar.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { deleteAsset } from '$lib/api/satellites.api';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';

	const { store, resetData }: DataContext<AssetNoContent> =
		getContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY);

	const { store: rulesStore }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let key: string | undefined;
	$: key = $store?.key;

	let asset: AssetNoContent | undefined;
	$: asset = $store?.data;

	let owner: Principal | undefined;
	$: owner = asset?.key.owner;

	let token: string | undefined;
	$: token = nonNullish(asset) ? fromNullable(asset.key.token) : undefined;

	let headers: [string, string][];
	$: headers = asset?.headers ?? [];

	let full_path: string | undefined;
	$: full_path = asset?.key.full_path;

	let downloadUrl: string | undefined;
	$: downloadUrl = nonNullish(full_path)
		? `${satelliteUrl($rulesStore.satelliteId.toText())}${full_path}${
				token !== undefined ? `?token=${token}` : ''
		  }`
		: undefined;

	let description: string | undefined;
	$: description = nonNullish(asset) ? fromNullable(asset.key.description) : undefined;

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
	$: deleteData = async (params: { collection: string; satelliteId: Principal }) => {
		if (isNullish(full_path) || full_path === '') {
			toasts.error({
				text: $i18n.errors.full_path_invalid
			});
			return;
		}

		await deleteAsset({
			...params,
			full_path
		});

		resetData();
	};
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

		{#if nonNullish(description)}
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.description}</svelte:fragment>
				<p class="description">{description}</p>
			</Value>
		{/if}

		{#if nonNullish(full_path) && nonNullish(downloadUrl)}
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.full_path}</svelte:fragment>
				<p class="description"><ExternalLink href={downloadUrl}>{full_path}</ExternalLink></p>
			</Value>
		{/if}

		{#if nonNullish(token)}
			<div class="data">
				<Value>
					<svelte:fragment slot="label">{$i18n.asset.token}</svelte:fragment>
					{token}
				</Value>
			</div>
		{/if}

		<div class="headers-block">
			<Value>
				<svelte:fragment slot="label">{$i18n.asset.headers}</svelte:fragment>
				<div class="headers">
					{#each headers as header}
						<span>{header[0]}: {header[1]}</span>
					{/each}
				</div>
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

		<DataToolbar {deleteData}>
			<svelte:fragment slot="del-title">{$i18n.asset.delete}</svelte:fragment>
			<svelte:fragment slot="del-content">{key}</svelte:fragment>
		</DataToolbar>
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

		padding: var(--padding-2x) var(--padding-2x) 0;
	}

	.owner {
		padding: 0 0 var(--padding);
	}

	.data,
	.date,
	.headers-block {
		padding: 0 0 var(--padding-2x);
	}

	.headers {
		display: flex;
		flex-direction: column;

		span {
			padding: var(--padding-0_5x) 0 0 0;
		}
	}
</style>
