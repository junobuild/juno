<script generics="T" lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { getContext, setContext, type Snippet, untrack } from 'svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { initListParamsContext } from '$lib/stores/app/list-params.context.store';
	import { initPaginationContext } from '$lib/stores/app/pagination.context.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import {
		LIST_PARAMS_CONTEXT_KEY,
		ListParamsKey,
		type ListParamsContext
	} from '$lib/types/list-params.context';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { emit } from '$lib/utils/events.utils';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';

	interface Props {
		satelliteId: Principal;
		children: Snippet;
		listFn: ListDocsFn<T>;
		errorLabel: string;
	}

	let { satelliteId, children, listFn, errorLabel }: Props = $props();

	const list = async () => {
		if (isNullish(satelliteId)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		const version = $versionStore?.satellites[satelliteId.toText()]?.current;

		if (isNullish(version)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const { items, matches_length, items_length } = await listFn({
				satelliteId,
				startAfter: $startAfter,
				filter: $listParams.filter,
				order: $listParams.order,
				identity: $authIdentity
			});

			setItems({ items, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: errorLabel,
				detail: err
			});
		}
	};

	setContext<PaginationContext<T>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const { setItems, startAfter }: PaginationContext<T> =
		getContext<PaginationContext<T>>(PAGINATION_CONTEXT_KEY);

	setContext<ListParamsContext>(
		LIST_PARAMS_CONTEXT_KEY,
		initListParamsContext(ListParamsKey.USERS)
	);

	const { listParams } = getContext<ListParamsContext>(LIST_PARAMS_CONTEXT_KEY);

	$effect(() => {
		$versionStore;
		$listParams;

		untrack(() => {
			list();
		});
	});

	export const reload = () => {
		// Not awaited on purpose, we want to close the popover no matter what
		list();

		emit({ message: 'junoCloseActions' });
	};
</script>

{@render children()}
