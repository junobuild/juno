<script lang="ts">
	export let opaque = false;
</script>

<header class:opaque>
	<slot />
</header>

<style lang="scss">
	@use '../../styles/mixins/media';

	header {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: var(--header-height);

		z-index: var(--z-index);

		display: flex;
		justify-content: space-between;
		align-items: center;

		background: var(--color-background);
		color: var(--color-background-contrast);

		padding: var(--padding-2x) var(--padding-2x);

		@include media.min-width(xlarge) {
			padding: var(--padding-4x) var(--padding-10x);
		}

		&:after {
			content: '';
			position: absolute;
			left: 50%;
			bottom: 0;
			transform: translate(-50%, 0);
			width: calc(100% - var(--padding-8x));
			border-bottom: 1px solid transparent;
			transition: border-bottom-color 0.15s ease-out;
			border-radius: calc(2 * var(--border-radius));
		}

		&.opaque {
			&:after {
				border-bottom: 3px solid black;
			}
		}
	}
</style>
