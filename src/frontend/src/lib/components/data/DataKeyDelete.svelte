<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import DataDelete from '$lib/components/data/DataDelete.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
</script>

<DataDelete {deleteData}>
	<svelte:fragment slot="button">{$i18n.core.delete}</svelte:fragment>

	<slot name="title" slot="title" />

	<Value>
		<svelte:fragment slot="label">{$i18n.collections.key}</svelte:fragment>
		<p><slot /></p>
	</Value>
</DataDelete>

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		@include text.truncate;
	}
</style>
