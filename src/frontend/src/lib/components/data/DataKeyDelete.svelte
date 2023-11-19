<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import type { Principal } from '@dfinity/principal';
	import DataDelete from '$lib/components/data/DataDelete.svelte';

	export let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
</script>

<DataDelete {deleteData}>
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
