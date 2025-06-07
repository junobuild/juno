<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import ListParamsFilter from '$lib/components/list/ListParamsFilter.svelte';
</script>

<ListParamsFilter
	direction="ltr"
	ownerFilter={false}
	key={{ label: $i18n.users.identifier, placeholder: $i18n.users.identifier_placeholder }}
/>
