<script lang="ts">
	import { Confetti } from 'svelte-confetti';
</script>

<Confetti
	amount={100}
	colorArray={['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)']}
	rounded
	x={[-0.25, 1]}
/>
