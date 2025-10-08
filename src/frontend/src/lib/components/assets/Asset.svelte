<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { deleteAsset } from '$lib/api/satellites.api';
	import AssetUpload from '$lib/components/assets/AssetUpload.svelte';
	import DataHeader from '$lib/components/data/DataHeader.svelte';
	import DataKeyDelete from '$lib/components/data/DataKeyDelete.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import type { SatelliteDid } from '$lib/types/declarations';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { formatToDate } from '$lib/utils/date.utils';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	const { store, resetData }: DataContext<SatelliteDid.AssetNoContent> =
		getContext<DataContext<SatelliteDid.AssetNoContent>>(DATA_CONTEXT_KEY);

	const { store: rulesStore }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const { resetPage, list }: PaginationContext<SatelliteDid.AssetNoContent> =
		getContext<PaginationContext<SatelliteDid.AssetNoContent>>(PAGINATION_CONTEXT_KEY);

	let key: string | undefined = $derived($store?.key);

	let asset = $derived($store?.data);

	let owner: Principal | undefined = $derived(asset?.key.owner);

	let token: string | undefined = $derived(
		nonNullish(asset) ? fromNullable(asset.key.token) : undefined
	);

	let headers: [string, string][] = $derived(asset?.headers ?? []);

	let full_path: string | undefined = $derived(asset?.key.full_path);

	let downloadUrl: string | undefined = $derived(
		nonNullish(full_path)
			? `${satelliteUrl($rulesStore.satelliteId.toText())}${full_path}${
					token !== undefined ? `?token=${token}` : ''
				}`
			: undefined
	);

	let description: string | undefined = $derived(
		nonNullish(asset) ? fromNullable(asset.key.description) : undefined
	);

	let version: bigint | undefined = $derived(fromNullishNullable(asset?.version));

	const deleteData = async (params: { collection: string; satelliteId: Principal }) => {
		if (isNullish(full_path) || full_path === '') {
			toasts.error({
				text: $i18n.errors.full_path_invalid
			});
			return;
		}

		await deleteAsset({
			...params,
			full_path,
			identity: $authStore.identity
		});

		resetData();
	};

	const reload = async () => {
		resetPage();
		resetData();
		await list();
	};
</script>

<div class="title doc">
	<DataHeader>
		{key ?? ''}

		{#snippet actions()}
			<AssetUpload {asset} onfileuploaded={reload}>
				{#snippet action()}
					{$i18n.asset.replace_file}
				{/snippet}
				{#snippet title()}
					{$i18n.asset.replace_file}
				{/snippet}
				{#snippet description()}
					{$i18n.asset.replace_description}
				{/snippet}
			</AssetUpload>

			<DataKeyDelete {deleteData}>
				{#snippet title()}
					{$i18n.asset.delete}
				{/snippet}
				{key}
			</DataKeyDelete>
		{/snippet}
	</DataHeader>
</div>

{#if nonNullish(asset)}
	<article class="doc">
		<div class="owner">
			<Value>
				{#snippet label()}
					{$i18n.asset.owner}
				{/snippet}
				<Identifier identifier={owner?.toText() ?? ''} />
			</Value>
		</div>

		{#if nonNullish(description)}
			<Value>
				{#snippet label()}
					{$i18n.asset.description}
				{/snippet}
				<p class="description">{description}</p>
			</Value>
		{/if}

		{#if nonNullish(full_path) && nonNullish(downloadUrl)}
			<Value>
				{#snippet label()}
					{$i18n.asset.full_path}
				{/snippet}
				<p class="description"><ExternalLink href={downloadUrl}>{full_path}</ExternalLink></p>
			</Value>
		{/if}

		{#if nonNullish(token)}
			<div class="data">
				<Value>
					{#snippet label()}
						{$i18n.asset.token}
					{/snippet}
					{token}
				</Value>
			</div>
		{/if}

		<div class="headers-block">
			<Value>
				{#snippet label()}
					{$i18n.asset.headers}
				{/snippet}
				<div class="headers">
					{#each headers as header, index (index)}
						<span>{header[0]}: {header[1]}</span>
					{/each}
				</div>
			</Value>
		</div>

		<div class="date">
			<Value>
				{#snippet label()}
					{$i18n.core.created}
				{/snippet}
				{formatToDate(asset.created_at)}
			</Value>
		</div>

		<div class="date">
			<Value>
				{#snippet label()}
					{$i18n.core.updated}
				{/snippet}
				{formatToDate(asset.updated_at)}
			</Value>
		</div>

		{#if nonNullish(version)}
			<div class="version">
				<Value>
					{#snippet label()}
						{$i18n.asset.version}
					{/snippet}
					{version}
				</Value>
			</div>
		{/if}
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
	.version,
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
