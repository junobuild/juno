<script lang="ts">
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	const createSatellite = async () => {
		await initSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button class="primary" onclick={createSatellite} {...testId(testIds.createSatellite.launch)}>
	{$i18n.satellites.launch}
</button>

<style lang="scss">
	button {
		height: 35px;
	}
</style>
