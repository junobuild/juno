<script lang="ts">
	import Copy from '$lib/components/ui/Copy.svelte';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	export let identifier: string;
	export let shorten = true;
	export let nomargin = false;

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

		margin: 0 0 var(--padding);
	}

	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);
		max-width: 100%;
	}

	.nomargin {
		margin: 0;

		span {
			margin: 0;
		}
	}
</style>
