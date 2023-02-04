<label><slot name="label" />:</label>
<div><slot /></div>

<style lang="scss">
	label {
		font-weight: var(--font-weight-bold);
	}

	div {
		color: var(--value-color);
	}
</style>
