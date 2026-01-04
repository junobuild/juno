<script lang="ts">
	import type { Snippet } from 'svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';

	interface Props {
		href: string;
		ariaLabel: string;
		description: Snippet;
		details?: Snippet;
		icon: Snippet;
		children: Snippet;
	}

	let { children, href, ariaLabel, description, details, icon }: Props = $props();

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);
</script>

<LaunchpadLink {ariaLabel} {href} {row}>
	{#snippet summary()}
		<div class="description">
			<p>{@render description()}</p>
			{@render details?.()}
		</div>
		{@render icon()}
	{/snippet}

	<div class="details" class:row>
		{@render children()}
	</div>
</LaunchpadLink>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/fonts';

	p {
		@include fonts.bold(true);

		@include text.truncate;
		margin: 0;
	}

	.description {
		display: flex;
		flex-direction: column;
		gap: var(--padding-0_25x);

		max-width: calc(100% - 48px);
	}
</style>
