<script lang="ts">
	import LaunchpadGuard from '$lib/components/modules/launchpad/LaunchpadGuard.svelte';
	import LaunchpadHeader from '$lib/components/modules/launchpad/LaunchpadHeader.svelte';
	import LaunchpadSegments from '$lib/components/modules/launchpad/LaunchpadSegments.svelte';
	import LaunchpadToolbar from '$lib/components/modules/launchpad/LaunchpadToolbar.svelte';
	import { satellites } from '$lib/derived/satellites.derived';

	let filter = $state('');

	let withoutGreetingsReturningLabel = $derived(($satellites?.length ?? 0n) === 0n);
</script>

<LaunchpadGuard>
	<section>
		<LaunchpadHeader {withoutGreetingsReturningLabel}>
			<LaunchpadToolbar bind:filter />
		</LaunchpadHeader>

		<LaunchpadSegments {filter} />
	</section>
</LaunchpadGuard>

<style lang="scss">
	@use '../../../styles/mixins/grid';

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;

		&:first-of-type {
			margin-top: var(--padding-4x);
		}
	}
</style>
