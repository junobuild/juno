<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import type { RepositoryKey } from '$declarations/satellite/satellite.did';
	import Confirmation from '$lib/components/app/core/Confirmation.svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { deleteAutomationRepoConfig } from '$lib/services/satellite/automation/automation.config.delete.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { Satellite } from '$lib/types/satellite';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { toDocRepositoryKey } from '$lib/utils/workflow.utils';

	interface Props {
		key: RepositoryKey;
		satellite: Satellite;
		config: SatelliteDid.OpenIdAutomationProviderConfig;
	}

	let { key, config, satellite }: Props = $props();

	let visibleDelete = $state(false);

	const close = () => (visibleDelete = false);

	const deleteRepoConfig = async () => {
		const automationConfig = $satelliteAutomationConfig;

		// If the provider config for GitHub is defined it's unlikely that the parent, the overall automation config is undefined.
		// This is rather to be seen as a TypeScript guard.
		if (isNullish(automationConfig)) {
			toasts.error({
				text: $i18n.errors.automation_config_undefined
			});
			return;
		}

		busy.start();

		await deleteAutomationRepoConfig({
			repoKey: key,
			automationConfig,
			providerConfig: config,
			identity: $authIdentity,
			satellite
		});

		busy.stop();
	};
</script>

<ButtonTableAction
	ariaLabel={$i18n.core.delete}
	icon="delete"
	onaction={() => (visibleDelete = true)}
/>

<Confirmation onno={close} onyes={deleteRepoConfig} size="wide" bind:visible={visibleDelete}>
	{#snippet title()}
		{$i18n.automation.delete_title}
	{/snippet}

	<p>
		<Html
			text={i18nFormat($i18n.automation.delete_question, [
				{
					placeholder: '{0}',
					value: toDocRepositoryKey(key)
				}
			])}
		/>
	</p>
</Confirmation>

<style lang="scss">
	p {
		white-space: pre-wrap;

		margin: 0 0 var(--padding-3x);
	}
</style>
