<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { orbiterLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import {
		initOrbiterWizard,
		initSatelliteWizard
	} from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	const createSatellite = async () => {
		close();

		await initSatelliteWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};

	const createAnalytics = async () => {
		close();

		await initOrbiterWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};

	const close = () => (visible = false);

	let visible = $state(false);
	let button = $state<HTMLButtonElement | undefined>();

	let analyticsNotEnabled = $derived(isNullish($orbiterStore) && $orbiterLoaded);
</script>

<button
	bind:this={button}
	class="primary"
	onclick={() => (visible = true)}
	{...testId(testIds.createSatellite.launch)}
>
	<span>{$i18n.core.launch}&nbsp;</span>
	<IconRocket size="16px" />
</button>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<button class="menu" onclick={createSatellite}
			><IconSatellite /> {$i18n.satellites.launch}</button
		>

		{#if analyticsNotEnabled}
			<button class="menu" onclick={createAnalytics}
				><IconAnalytics /> {$i18n.analytics.create}</button
			>
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.primary {
		height: 35px;
	}
</style>
