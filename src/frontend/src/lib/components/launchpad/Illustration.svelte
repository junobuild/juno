<script lang="ts">
	import Illustration from '$lib/assets/illustration.svg';
</script>

<img
	src={Illustration}
	role="presentation"
	loading="lazy"
	decoding="async"
	alt=""
	class="illustration"
/>

<style lang="scss">
	@use '../../styles/mixins/media';

	.illustration {
		position: fixed;

		display: none;

		user-select: none;
		pointer-events: none;
		-webkit-user-drag: none;
		user-drag: none;

		@include media.min-width(xlarge) {
			right: 0;
			bottom: 0;
			width: 45vw;
			max-width: media.$breakpoint-large;
			transform: translate(18%, 48%);

			display: block;
		}
	}
</style>
