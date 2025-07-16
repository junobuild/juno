<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		color?: 'lavender' | 'white';
		size?: string;
	}

	let { size = '24px', color = 'lavender' }: Props = $props();
</script>

<svg
	id="Layer_2"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 274.35 220.39"
	height={size}
	class:white={color === 'white'}
	><g id="Layer_1-2"
		><g
			><rect x="0" y="0" width="220.39" height="220.39" rx="110.19" ry="110.19" /><circle
				class="icon-juno-logo"
				cx="206.21"
				cy="68.14"
				r="68.14"
			/></g
		></g
	></svg
>

<style lang="scss">
	@use '../../styles/mixins/media';

	.white {
		--logo-color: #fff;
	}

	.icon-juno-logo {
		fill: var(--logo-color, var(--color-primary));
	}

	@include media.dark-theme {
		svg {
			fill: var(--text-color);
			--logo-color: var(--color-primary);
		}

		.white {
			--logo-color: var(--color-primary);
		}
	}
</style>
