<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';

	export let url: string;
	export let ariaLabel = '';
	export let type: 'default' | 'custom' = 'default';

	let host = '';
	$: ({ host } = new URL(url));
</script>

<div>
	<ExternalLink href={url} {ariaLabel}>{host}</ExternalLink>
	<span>{type}</span>
</div>

<style lang="scss">
	@use '../../styles/mixins/fonts';

	div {
		display: flex;
		flex-direction: column;
	}

	span {
		@include fonts.small;
		color: var(--color-primary);
	}
</style>
