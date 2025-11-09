<script lang="ts">
	import IconSpaceStation from '$lib/components/icons/IconSpaceStation.svelte';
</script>

<aside class="banner"><IconSpaceStation /> Dev Console</aside>

<style lang="scss">
	.banner {
		height: var(--banner-height);

		background: var(--color-tertiary);
		color: var(--color-tertiary-contrast);

		font-weight: var(--font-weight-bold);

		display: flex;
		justify-content: center;
		align-items: center;

		gap: var(--padding);
	}
</style>
