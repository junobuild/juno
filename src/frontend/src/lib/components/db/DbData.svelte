<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Doc as DocType, Doc as DocDid } from '$declarations/satellite/satellite.did';
	import { listDocs } from '$lib/api/satellites.api';
	import { listDocs008 } from '$lib/api/satellites.deprecated.api';
	import Data from '$lib/components/data/Data.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import Doc from '$lib/components/docs/Doc.svelte';
	import DocForm from '$lib/components/docs/DocHeader.svelte';
	import Docs from '$lib/components/docs/Docs.svelte';
	import { SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { initPaginationContext } from '$lib/stores/pagination.context.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import type { ListParams } from '$lib/types/list';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const docsStore = writable<DataStoreData<DocDid>>(undefined);

	const resetData = () => docsStore.set(null);

	setContext<DataContext<DocDid>>(DATA_CONTEXT_KEY, {
		store: docsStore,
		resetData
	});

	const list = async () => {
		try {
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			const version = $versionStore?.satellites[$store.satelliteId.toText()]?.current;

			if (isNullish(version)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			const list = compare(version, SATELLITE_v0_0_9) >= 0 ? listDocs : listDocs008;

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
				text: $i18n.errors.load_documents,
				detail: err
			});
		}
	};

	setContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const { setItems, startAfter }: PaginationContext<DocType> =
		getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	let collection: string | undefined = $derived($store.rule?.[0]);
</script>

<Data onclose={resetData}>
	<Docs />
	<Doc />
	<DocForm />

	{#snippet count()}
		<DataCount />
	{/snippet}
</Data>
