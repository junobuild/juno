<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import LaunchpadGuard from '$lib/components/modules/launchpad/LaunchpadGuard.svelte';
	import LaunchpadHeader from '$lib/components/modules/launchpad/LaunchpadHeader.svelte';
	import LaunchpadSegments from '$lib/components/modules/launchpad/LaunchpadSegments.svelte';
	import LaunchpadToolbar from '$lib/components/modules/launchpad/LaunchpadToolbar.svelte';
	import { account } from '$lib/derived/console/account.derived';
	import { satellites } from '$lib/derived/satellites.derived';

	let filter = $state('');

	// If the user was never updated, they never received credits.
	// We do this check to e.g. not display the getting started banner on Skylab.
	let userNoFirstCredits = $derived(
		nonNullish($account) &&
			$account.created_at === $account.updated_at &&
			$account.credits.e8s === 0n
	);

	let withoutGreetingsReturningLabel = $derived(($satellites?.length ?? 0n) === 0n);
</script>

<LaunchpadGuard>
	<section>
		<LaunchpadHeader userGettingStarted={userNoFirstCredits} {withoutGreetingsReturningLabel}>
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
