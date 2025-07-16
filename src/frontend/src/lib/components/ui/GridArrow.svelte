<script lang="ts">
	import IconArrowCircleDown from '$lib/components/icons/IconArrowCircleDown.svelte';

	interface Props {
		small?: boolean;
	}

	let { small }: Props = $props();
</script>

<div class="arrow" class:small>
	<div class="arrow-icon">
		<IconArrowCircleDown size={small ? '32px' : '48px'} />
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.arrow {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 0 var(--padding-3x);

		@include media.min-width(large) {
			grid-row: 1/3;
			grid-column: 2/3;

			.arrow-icon {
				display: flex;
				justify-content: center;

				transform: rotate(-90deg);
			}
		}
	}

	.small {
		padding: 0;

		@include media.min-width(large) {
			padding: 0 0 var(--padding);
		}
	}
</style>
