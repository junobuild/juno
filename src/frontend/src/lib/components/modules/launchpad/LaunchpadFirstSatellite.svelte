<script lang="ts">
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import LaunchpadButton from '$lib/components/modules/launchpad/LaunchpadButton.svelte';
	import LaunchpadHeader from '$lib/components/modules/launchpad/LaunchpadHeader.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { account } from '$lib/derived/console/account.derived';
	import { nonNullish } from '@dfinity/utils';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};

	// If the user was never updated, they never received credits.
	// We do this check to e.g. not display the getting started banner on Skylab.
	let userNoFirstCredits = $derived(
		nonNullish($account) &&
			$account.created_at === $account.updated_at &&
			$account.credits.e8s === 0n
	);
</script>

<LaunchpadHeader withoutGreetingsReturningLabel userGettingStarted={userNoFirstCredits} />

<LaunchpadButton onclick={createSatellite} testId={testIds.launchpad.launch}>
	<div class="new">
		<IconRocket size="48px" />

		<p>{$i18n.satellites.launch_first}</p>
	</div>
</LaunchpadButton>

<style lang="scss">
	@use '../../../styles/mixins/fonts';

	.new {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		gap: var(--padding-4x);

		height: 100%;
	}

	p {
		@include fonts.bold(true);

		max-width: 150px;
		text-align: center;

		margin: 0;
	}
</style>
