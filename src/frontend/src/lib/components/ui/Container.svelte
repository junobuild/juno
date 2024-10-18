<div class="container">
	<div class="overview">
		<h1><slot name="title" /></h1>

		<p><slot /></p>
	</div>

	<div class="sign-in">
		<slot name="actions" />
	</div>
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	.overview {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;

		min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--padding-8x));
	}

	h1 {
		color: var(--color-primary);
		padding: var(--padding-2x) 0 var(--padding);

		--bigger-title: 1;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));

		@include media.min-width(large) {
			--bigger-title: 1.4;
			margin-top: var(--padding-8x);
		}
	}

	h1,
	p {
		max-width: 470px;
	}

	.sign-in {
		padding: var(--padding) 0 0;
	}

	button {
		font-size: var(--font-size-small);
	}
</style>
