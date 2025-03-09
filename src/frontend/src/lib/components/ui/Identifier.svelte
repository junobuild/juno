<script lang="ts">
	import Copy from '$lib/components/ui/Copy.svelte';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	interface Props {
		identifier: string;
		shorten?: boolean;
		small?: boolean;
		what?: string;
	}

	let { identifier, shorten = true, small = true, what }: Props = $props();

	let shortIdentifier: string = $derived(
		shorten ? shortenWithMiddleEllipsis(identifier) : identifier
	);
</script>

<p class:small>
	<span class:small>{shortIdentifier}</span>
	<Copy value={identifier} {what} />
</p>

<style lang="scss">
	@use '../../styles/mixins/text';

	span {
		word-break: break-all;
		@include text.truncate;

		&.small {
			margin: 0 0 var(--padding-0_5x);
		}
	}

	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
		max-width: 100%;
	}

	.small {
		margin: 0 0 var(--padding);
	}
</style>
