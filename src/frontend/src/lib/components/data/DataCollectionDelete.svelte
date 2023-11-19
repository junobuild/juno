<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import DataDelete from '$lib/components/data/DataDelete.svelte';

	export let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
</script>

<DataDelete {deleteData}>
	<slot name="title" slot="title" />

	<p><slot /></p>
</DataDelete>

<style lang="scss">
	p {
		white-space: initial;
		word-break: break-word;
	}
</style>
