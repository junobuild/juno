<script lang="ts">
	import { authIdentity } from '$lib/derived/auth.derived';
	import { initMissionControlWizard } from '$lib/services/factory/factory-wizard.services';
	import { i18n } from '$lib/stores/app/i18n.store';

	const createMissionControl = async () => {
		await initMissionControlWizard({
			identity: $authIdentity
		});
	};
</script>

<button onclick={createMissionControl}>{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
