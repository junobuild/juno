<script lang="ts">
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { initOrbiterWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	const createOrbiter = async () => {
		await initOrbiterWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<button onclick={createOrbiter} {...testId(testIds.createAnalytics.launch)}>{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
