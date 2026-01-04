<script lang="ts">
	import ContainerGettingStarted from '$lib/components/ui/ContainerGettingStarted.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { initMissionControlWizard } from '$lib/services/factory/factory.create.services';
	import { i18n } from '$lib/stores/app/i18n.store';

	const createMissionControl = async () => {
		await initMissionControlWizard({
			identity: $authIdentity
		});
	};
</script>

<ContainerGettingStarted>
	{$i18n.monitoring.requires_mission_control}
</ContainerGettingStarted>

<button onclick={createMissionControl}>{$i18n.core.get_started}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
