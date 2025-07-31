<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		color?: 'lavender' | 'white';
	}

	let { color = 'lavender' }: Props = $props();
</script>

<svg class:white={color === 'white'} viewBox="0 0 1000 220.39" xmlns="http://www.w3.org/2000/svg"
	><g
		><g
			><path
				d="m238.29,0h220.39v110.19c0,60.82-49.38,110.19-110.19,110.19h0c-60.82,0-110.19-49.38-110.19-110.19V0h0Z"
			/><path
				d="m487.36,214.99h220.39v-104.8c0-60.86-49.34-110.19-110.19-110.19h-110.19s0,214.99,0,214.99Z"
			/><rect height="220.39" rx="110.19" ry="110.19" width="220.39" x="725.65" y="0" /><path
				d="m101.31,0c0,55.96-45.36,101.32-101.31,101.32v119.07C121.72,220.39,220.39,121.72,220.39,0h0s-119.07,0-119.07,0Z"
			/><circle class="icon-juno-logo" cx="931.86" cy="68.14" r="68.14" /></g
		></g
	></svg
>

<style lang="scss">
	@use '../../styles/mixins/media';

	svg {
		width: calc(2 * var(--padding-8x));
	}

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
