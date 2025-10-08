<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { listAssets } from '$lib/api/satellites.api';
	import { listAssets008, listAssets009 } from '$lib/api/satellites.deprecated.api';
	import Asset from '$lib/components/assets/Asset.svelte';
	import Assets from '$lib/components/assets/Assets.svelte';
	import Data from '$lib/components/data/Data.svelte';
	import DataCollectionsHeaderWithFilter from '$lib/components/data/DataCollectionsHeaderWithFilter.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import { SATELLITE_v0_0_10, SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { initPaginationContext } from '$lib/stores/pagination.context.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import type { SatelliteDid } from '$lib/types/declarations';
	import type { ListParams } from '$lib/types/list';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const assetsStore = writable<DataStoreData<SatelliteDid.AssetNoContent>>(undefined);

	const resetData = () => assetsStore.set(null);

	setContext<DataContext<SatelliteDid.AssetNoContent>>(DATA_CONTEXT_KEY, {
		store: assetsStore,
		resetData
	});

	const list = async () => {
		if (isNullish(collection)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const version = $versionStore?.satellites[$store.satelliteId.toText()]?.current;

			if (isNullish(version)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			const list =
				compare(version, SATELLITE_v0_0_10) >= 0
					? listAssets
					: compare(version, SATELLITE_v0_0_9) >= 0
						? listAssets009
						: listAssets008;

			const { items, matches_length, items_length } = await list({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $startAfter,
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

	setContext<PaginationContext<SatelliteDid.AssetNoContent>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const { setItems, startAfter }: PaginationContext<SatelliteDid.AssetNoContent> =
		getContext<PaginationContext<SatelliteDid.AssetNoContent>>(PAGINATION_CONTEXT_KEY);

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined = $derived($store.rule?.[0]);

	let includeSysCollections = $state(false);
</script>

<Data displayEmpty={!includeSysCollections} onclose={resetData}>
	<Assets {includeSysCollections} />

	<Asset />

	{#snippet count()}
		<DataCount />
	{/snippet}

	{#snippet header()}
		<DataCollectionsHeaderWithFilter onclose={resetData} bind:includeSysCollections />
	{/snippet}
</Data>
