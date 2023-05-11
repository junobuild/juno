<script lang="ts">
	export let ref: undefined | string = undefined;
</script>

<label for={ref}><slot name="label" />:</label>
<div><slot /></div>

<style lang="scss">
	label {
		font-weight: var(--font-weight-bold);
	}

	div {
		color: var(--value-color);
	}
</style>
