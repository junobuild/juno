<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import DataDelete from '$lib/components/data/DataDelete.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
</script>

<DataDelete {deleteData}>
	<slot name="button" slot="button" />
	<slot name="title" slot="title" />

	<p><slot /></p>

	<p>{$i18n.core.are_you_sure}</p>
</DataDelete>

<style lang="scss">
	p {
		white-space: initial;
		word-break: break-word;
	}
</style>
