<script lang="ts">
	import Copy from '$lib/components/ui/Copy.svelte';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	export let identifier: string;
	export let shorten = true;
	export let nomargin = true;

	let shortIdentifier: string;
	$: shortIdentifier = shorten ? shortenWithMiddleEllipsis(identifier) : identifier;
</script>

<p class:nomargin>
	<span>{shortIdentifier}</span>
	<Copy value={identifier} />
</p>

<style lang="scss">
	@use '../../styles/mixins/text';

	span {
		word-break: break-all;
		@include text.truncate;
	}

	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);
		margin: 0 0 1rem;
		max-width: 100%;
	}

	.nomargin {
		margin: 0;
	}
</style>
