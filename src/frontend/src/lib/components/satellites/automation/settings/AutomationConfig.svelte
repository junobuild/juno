<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import AutomationKeysConfig from '$lib/components/satellites/automation/settings/AutomationKeysConfig.svelte';
	import GitHubConfig from '$lib/components/satellites/automation/settings/GitHubConfig.svelte';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
		config: SatelliteDid.OpenIdAutomationProviderConfig;
	}

	let { satellite, config }: Props = $props();

	const openModal = ({
		type
	}: {
		type: 'edit_automation_keys_config' | 'edit_automation_connect_repository_config';
	}) => {
		const automationConfig = $satelliteAutomationConfig;

		// If the provider config for GitHub is defined it's unlikely that the parent, the overall automation config is undefined.
		// This is rather to be seen as a TypeScript guard.
		if (isNullish(automationConfig)) {
			toasts.error({
				text: $i18n.errors.automation_config_undefined
			});
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					automationConfig,
					providerConfig: config,
					satellite
				}
			}
		});
	};
</script>

<GitHubConfig {config} {openModal} />

<AutomationKeysConfig {config} {openModal} />
