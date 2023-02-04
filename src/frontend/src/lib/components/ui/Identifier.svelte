<script lang="ts">
	import Copy from '$lib/components/ui/Copy.svelte';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	export let identifier: string;

	let shortIdentifier: string;
	$: shortIdentifier = shortenWithMiddleEllipsis(identifier);
</script>

<p>
	<span>{shortIdentifier}</span>
	<Copy value={identifier} />
</p>

<style lang="scss">
	span {
		word-break: break-all;
	}

	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);
		margin: 0;
	}
</style>
