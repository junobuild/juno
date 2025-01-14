<script lang="ts">
	import IconArrowCircleDown from '$lib/components/icons/IconArrowCircleDown.svelte';
</script>

<div class="arrow">
	<div class="arrow-icon">
		<IconArrowCircleDown />
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
				transform: rotate(-90deg);
			}
		}
	}
</style>
