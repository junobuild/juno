<script lang="ts">
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import DataFilter from '$lib/components/data/DataFilter.svelte';
</script>

<div class="sort">
	<span><slot /></span>

	<div>
		<DataFilter />
		<DataOrder />
	</div>
</div>

<style lang="scss">
	.sort {
		display: flex;
		justify-content: space-between;
	}

	div {
		display: flex;
		gap: var(--padding-1_5x);
	}
</style>
