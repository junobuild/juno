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

		z-index: calc(var(--z-index) + 2);

		display: flex;
		justify-content: space-between;
		align-items: center;

		color: var(--color-background-contrast);

		pointer-events: none;

		padding: var(--padding-2x) var(--padding-2x);

		@include media.min-width(xlarge) {
			padding: var(--padding-4x) var(--padding-6x);
		}

		&.opaque {
			background: var(--color-background);
		}

		:global(*) {
			pointer-events: all;
		}
	}
</style>
