<script lang="ts">
	import { Confetti } from 'svelte-confetti';
</script>

<div>
	<Confetti
		rounded
		x={[-5, 5]}
		y={[0, 0.1]}
		infinite
		duration={5000}
		amount={200}
		fallDistance="300px"
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
	}
</style>
