<script lang="ts">
	import { debounce, fromNullishNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { missionControlSettingsLoaded } from '$lib/derived/mission-control-settings.derived';
	import { missionControlConfigMonitoring } from '$lib/derived/mission-control-user.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { setMonitoringNotification } from '$lib/services/monitoring.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	let enabled = $state(false);

	let monitoringEnabled = $derived(
		fromNullishNullable(fromNullishNullable($missionControlConfigMonitoring?.cycles)?.notification)
			?.enabled === true
	);

	onMount(() => {
		enabled = monitoringEnabled;
	});

	const toggleMonitoring = async () => {
		// No changes required
		if (enabled === monitoringEnabled) {
			return;
		}

		busy.start();

		await setMonitoringNotification({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived,
			monitoringConfig: $missionControlConfigMonitoring,
			enabled
		});

		busy.stop();
	};

	const debounceToggle = debounce(toggleMonitoring);

	const onToggle = () => {
		enabled = !enabled;

		debounceToggle();
	};
</script>

{#if $missionControlSettingsLoaded}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.notifications}
			{/snippet}

			<Toggle {enabled} onclick={onToggle}
				><span>{enabled ? $i18n.core.enabled : $i18n.core.disabled}</span></Toggle
			>
		</Value>
	</div>
{/if}
