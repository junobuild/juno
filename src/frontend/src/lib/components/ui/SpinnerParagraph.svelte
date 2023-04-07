<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
</script>

<p class="label loading"><slot /> <Spinner inline /></p>

<style lang="scss">
	.loading {
		display: flex;
		gap: var(--padding);
		align-items: center;
		--spinner-size: 1rem;
	}

	p {
		margin-top: var(--padding-3x);
		color: var(--value-color);
	}
</style>
