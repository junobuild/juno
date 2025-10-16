<script lang="ts">
	import ListParamsFilter from '$lib/components/list/ListParamsFilter.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ListParamsStore } from '$lib/stores/list-params.store';

	interface Props {
		listParamsStore: ListParamsStore;
	}

	let { listParamsStore }: Props = $props();
</script>

<ListParamsFilter
	direction="ltr"
	key={{ label: $i18n.users.identifier, placeholder: $i18n.users.identifier_placeholder }}
	{listParamsStore}
	ownerFilter={false}
/>
