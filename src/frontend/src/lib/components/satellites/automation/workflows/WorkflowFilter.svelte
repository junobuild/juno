<script lang="ts">
	import ListParamsFilter from '$lib/components/satellites/list/ListParamsFilter.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<ListParamsFilter
	direction="ltr"
	key={{ label: $i18n.sort.keys, placeholder: $i18n.automation.workflow_placeholder }}
	ownerFilter={false}
/>
