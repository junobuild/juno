<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import Assets from '$lib/components/assets/Assets.svelte';
	import Asset from '$lib/components/assets/Asset.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { isNullish } from '@dfinity/utils';
	import { listAssets, satelliteVersion } from '$lib/api/satellites.api';
	import { authStore } from '$lib/stores/auth.store';
	import { compare } from 'semver';
	import { listAssets008, listAssets009 } from '$lib/api/satellites.deprecated.api';
	import { listParamsStore } from '$lib/stores/data.store';
	import type { ListParams } from '$lib/types/list';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';

	const assetsStore = writable<DataStoreData<AssetNoContent>>(undefined);

	const resetData = () => assetsStore.set(null);

	setContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY, {
		store: assetsStore,
		resetData
	});

	const list = async () => {
		if (isNullish(collection)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const version = await satelliteVersion({
				satelliteId: $store.satelliteId,
				identity: $authStore.identity
			});

			// TODO: remove at the same time as satellite version query
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			const list =
				compare(version, '0.0.10') >= 0
					? listAssets
					: compare(version, '0.0.9') >= 0
						? listAssets009
						: listAssets008;

			const { items, matches_length, items_length } = await list({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $paginationStore.startAfter,
					// prettier-ignore parenthesis required for Webstorm Svelte plugin
					...$listParamsStore
				} as ListParams,
				identity: $authStore.identity
			});
			setItems({ items, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: `Error while listing the assets.`,
				detail: err
			});
		}
	};

	setContext<PaginationContext<AssetNoContent>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const { store: paginationStore, setItems }: PaginationContext<AssetNoContent> =
		getContext<PaginationContext<AssetNoContent>>(PAGINATION_CONTEXT_KEY);

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];
</script>

<Data on:junoCloseData={resetData}>
	<Assets />

	<Asset />

	<DataCount slot="count" />
</Data>
