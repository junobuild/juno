<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, onMount, setContext } from 'svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listUsers } from '$lib/services/users.services';
	import User from '$lib/components/auth/User.svelte';
	import type { User as UserType } from '$lib/types/user';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import {canisterLogs} from "$lib/api/ic.api";
	import {authStore} from "$lib/stores/auth.store";

	export let satelliteId: Principal;

	const list = async () => {
        if (isNullish($authStore.identity)) {
            return;
        }

        // TODO: does not work
        console.log(satelliteId.toText(), $authStore.identity.getPrincipal().toText())
        await canisterLogs({canisterId: satelliteId, identity: $authStore.identity});
	};

	onMount(async () => await list());
</script>

<div class="table-container">

</div>
