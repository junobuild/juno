<script lang="ts">
	import Illustration from '$lib/assets/illustration.svg';

	export let sticky = false;
</script>

<img
	src={Illustration}
	role="presentation"
	loading="lazy"
	decoding="async"
	alt=""
	class="illustration"
	class:sticky
/>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	.illustration {
		position: absolute;

		right: -150px;
		bottom: -225px;
		width: 100vw;
		max-width: media.$breakpoint-medium;

		display: block;

		z-index: calc(var(--z-index) + 1);

		user-select: none;
		pointer-events: none;
		-webkit-user-drag: none;
		user-drag: none;

		@media (max-height: 860px) and (max-width: 1024px) {
			display: none;
		}

		&:not(.sticky) {
			@include media.min-width(large) {
				top: 50%;
				right: 0;
				bottom: auto;
				width: 50vw;
				transform: translate(0, calc(-50% - var(--padding-8x)));
			}
		}
	}
</style>
