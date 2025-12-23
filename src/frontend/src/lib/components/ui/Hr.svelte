<hr />

<style lang="scss">
	@use '../../styles/mixins/media';

	hr {
		width: calc(100% - var(--padding-2x));
		height: auto;

		margin: var(--padding-0_5x) auto;
		padding: 0;

		border-bottom: 1px solid var(--color-background-shade);

		&::before {
			content: none;
		}
	}

	@include media.dark-theme {
		hr {
			border-color: var(--color-background-tint);
		}
	}
</style>
