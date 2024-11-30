<!-- adapted from pen: https://codepen.io/mimoh/pen/VmVqPB -->
<script lang="ts">
	interface Props {
		inline?: boolean;
	}

	let { inline = false }: Props = $props();
</script>

<div class="spinner" class:inline></div>

<style lang="scss">
	@use '../../styles/mixins/media';

	@include media.dark-theme {
		.spinner {
			border-color: var(--text-color);
		}
	}

	@include media.light-theme {
		.spinner.inline {
			border-color: var(--color-primary);
		}
	}

	.spinner {
		display: block;

		background: transparent;
		border: var(--spinner-border-size, 2px) solid var(--label-color);

		margin: var(--spinner-margin);

		width: var(--spinner-size);
		height: var(--spinner-size);

		border-radius: 50%;

		animation: spinner-rotate 1.2s infinite linear;

		&:not(.inline) {
			position: absolute;
			top: calc(50% - (var(--spinner-size) / 2));
			left: calc(50% - (var(--spinner-size) / 2));
		}
	}

	/* -global- */
	@keyframes -global-spinner-rotate {
		0% {
			transform: perspective(120px) rotateX(0deg) rotateY(0deg);
		}
		50% {
			transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
		}
		100% {
			transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
		}
	}
</style>
