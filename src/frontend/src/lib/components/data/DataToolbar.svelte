<script lang="ts">
	import DataDelete from '$lib/components/data/DataDelete.svelte';

	export let deleteData: (collection: string) => Promise<void>;
</script>

<div class="toolbar">
	<DataDelete {deleteData}>
		<slot name="del-title" slot="title" />
		<slot name="del-content" />
	</DataDelete>
</div>

<style lang="scss">
	@use '../../styles/mixins/collections';

	.toolbar {
		@include collections.toolbar;

		flex: 2;
		align-items: flex-end;
	}
</style>
