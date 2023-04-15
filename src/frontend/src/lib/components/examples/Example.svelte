<script lang="ts">
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';

	export let href: string;
</script>

<a rel="external noopener noreferrer" target="_blank" class="article">
	<div class="summary">
		<slot name="icon" />

		<h5><slot name="title" /></h5>
	</div>

	<p><slot /></p>

	<div class="icon">
		<IconArrowOutward />
	</div>
</a>

<style lang="scss">
	.summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--padding-4x) var(--padding-4x) var(--padding);
		gap: var(--padding-2x);
	}

	p {
		padding: var(--padding) var(--padding-4x) var(--padding);
		min-height: 100px;
	}

	.icon {
		position: absolute;
		top: 0;
		right: 0;
		padding: var(--padding);
	}

	h5 {
		margin: 0;
	}
</style>
