<script lang="ts">
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import type { ComponentType } from 'svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';

	// Source of the animation: https://codepen.io/nelledejones/pen/gOOPWrK
	export let animation: 'gelatine' | 'swing' = 'gelatine';
	export let icon: 'satellite' | 'rocket' = 'rocket';
	export let small = false;

	let iconCmp: ComponentType;
	$: iconCmp = icon === 'satellite' ? IconSatellite : IconRocket;
</script>

<div class="spinner" class:swing={animation === 'swing'} class:gelatine={animation === 'gelatine'}>
	<svelte:component this={iconCmp} size={small ? '16px' : '40px'} />
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	/* -global- */
	@keyframes -global-gelatine {
		from,
		to {
			transform: scale(1, 1);
		}
		25% {
			transform: scale(0.9, 1.1);
		}
		50% {
			transform: scale(1.1, 0.9);
		}
		75% {
			transform: scale(0.95, 1.05);
		}
	}

	/* -global- */
	@keyframes -global-swing {
		20% {
			transform: rotate(15deg);
		}
		40% {
			transform: rotate(-10deg);
		}
		60% {
			transform: rotate(5deg);
		}
		80% {
			transform: rotate(-5deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	.gelatine {
		animation: gelatine 0.5s infinite;
	}

	.swing {
		animation: swing 2s ease infinite;
	}

	.spinner {
		display: inline-flex;
	}
</style>
