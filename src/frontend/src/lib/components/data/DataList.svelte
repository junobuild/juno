<script lang="ts">
	import DataOrder from "$lib/components/data/DataOrder.svelte";
</script>

<div class="sort">
	<span><slot /></span>

	<div>
		<DataOrder/>
	</div>
</div>

<style lang="scss">
	.sort {
		display: flex;
		justify-content: space-between;
	}
</style>
