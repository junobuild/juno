<script lang="ts">
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { initOrbiterWizard } from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	const createOrbiter = async () => {
		await initOrbiterWizard({
			identity: $authIdentity,
			missionControlId: $missionControlId
		});
	};
</script>

<button onclick={createOrbiter} {...testId(testIds.createAnalytics.launch)}
	>{$i18n.core.get_started}</button
>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
