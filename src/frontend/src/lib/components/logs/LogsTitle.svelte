<div class="actions">
	<span><slot /></span>

	<div>
		<slot name="actions" />
	</div>
</div>

<style lang="scss">
	.actions {
		display: flex;
		justify-content: space-between;
	}

	div {
		display: flex;
		gap: var(--padding-1_5x);
	}
</style>
