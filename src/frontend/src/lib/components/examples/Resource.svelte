<script lang="ts">
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';

	interface Props {
		href: string;
		icon?: import('svelte').Snippet;
		title?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { href, icon, title, children }: Props = $props();
</script>

<a rel="external noopener noreferrer" target="_blank" class="article" {href}>
	<div class="summary">
		{@render icon?.()}

		<h5>{@render title?.()}</h5>
	</div>

	<p>{@render children?.()}</p>

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
