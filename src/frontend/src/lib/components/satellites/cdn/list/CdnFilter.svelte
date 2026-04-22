<script lang="ts">
	import ListParamsFilter from '$lib/components/satellites/list/ListParamsFilter.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<ListParamsFilter
	direction="ltr"
	key={{ label: $i18n.users.identifier, placeholder: $i18n.users.identifier_placeholder }}
	ownerFilter={false}
/>
