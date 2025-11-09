<script lang="ts">
	import { Confetti } from 'svelte-confetti';

	interface Props {
		display?: 'modal' | 'popover';
	}

	let { display = 'modal' }: Props = $props();
</script>

<div class={display}>
	<Confetti
		amount={200}
		colorArray={['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)']}
		duration={5000}
		fallDistance="300px"
		infinite
		rounded
		x={[-5, 5]}
		y={[0, 0.1]}
	/>
</div>

<style lang="scss">
	div {
		pointer-events: none;
		position: fixed;
		top: -50px;
		left: 0;
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		overflow: hidden;

		&.popover {
			position: absolute;
			height: 100%;
			min-height: calc(100% + 50px);
			width: 100%;
			pointer-events: none;
		}
	}
</style>
