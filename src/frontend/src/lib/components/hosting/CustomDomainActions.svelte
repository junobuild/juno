<script lang="ts">
	import { isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { run, stopPropagation } from 'svelte/legacy';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type {
		AuthenticationConfig,
		CustomDomain as CustomDomainType
	} from '$declarations/satellite/satellite.did';
	import { setAuthConfig } from '$lib/api/satellites.api';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { deleteCustomDomain as deleteCustomDomainService } from '$lib/services/hosting.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { JunoModalCustomDomainDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';
	import { buildDeleteAuthenticationConfig } from '$lib/utils/auth.config.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		satellite: Satellite;
		customDomain: [string, CustomDomainType] | undefined;
		displayState: Option<string>;
		config: AuthenticationConfig | undefined;
	}

	let { satellite, customDomain, displayState, config }: Props = $props();

	let visible = $state(false);

	const openDelete = () => {
		if (isNullish(customDomain)) {
			toasts.error({
				text: $i18n.errors.hosting_no_custom_domain
			});
			return;
		}

		visible = true;
	};

	let deleteMainDomain = $state(false);
	run(() => {
		deleteMainDomain =
			nonNullish(customDomain?.[0]) &&
			customDomain?.[0] ===
				fromNullishNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin);
	});

	let advancedOptions = $state(false);
	let skipDeleteDomain = $state(false);

	const updateConfig = async () => {
		if (isNullish(config)) {
			return;
		}

		const updateConfig = deleteMainDomain ? buildDeleteAuthenticationConfig(config) : config;

		await setAuthConfig({
			satelliteId: satellite.satellite_id,
			config: updateConfig,
			identity: $authStore.identity
		});
	};

	const deleteCustomDomain = async () => {
		if (isNullish(customDomain)) {
			toasts.error({
				text: $i18n.errors.hosting_no_custom_domain
			});
			return;
		}

		busy.start();

		try {
			await deleteCustomDomainService({
				satelliteId: satellite.satellite_id,
				domainName: customDomain[0],
				customDomain: customDomain[1],
				deleteCustomDomain: !skipDeleteDomain
			});

			await updateConfig();

			emit({ message: 'junoSyncCustomDomains' });

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_delete_custom_domain,
				detail: err
			});

			advancedOptions = true;
		}

		busy.stop();
	};

	const openAddCustomDomain = (params: Pick<JunoModalCustomDomainDetail, 'editDomainName'>) => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'add_custom_domain',
				detail: { satellite, config, ...params }
			}
		});
	};
</script>

<div class="tools">
	<ButtonTableAction onaction={openDelete} ariaLabel={$i18n.hosting.delete} icon="delete" />

	{#if displayState !== undefined && displayState?.toLowerCase() !== 'available'}
		<ButtonTableAction
			onaction={() => openAddCustomDomain({ editDomainName: customDomain?.[0] })}
			ariaLabel={$i18n.hosting.edit}
			icon="edit"
		/>
	{/if}
</div>

<Popover bind:visible center={true}>
	<div class="content">
		<h3>
			<Html
				text={i18nFormat($i18n.hosting.delete_custom_domain, [
					{
						placeholder: '{0}',
						value: customDomain?.[0] ?? ''
					}
				])}
			/>
		</h3>

		<p>{$i18n.hosting.before_continuing}</p>

		{#if deleteMainDomain}
			<p><span class="warning"><IconWarning /></span> {$i18n.hosting.delete_auth_domain_warning}</p>
		{/if}

		<p>{$i18n.hosting.delete_are_you_sure}</p>

		<div class="toolbar">
			<button type="button" onclick={stopPropagation(() => (visible = false))} disabled={$isBusy}>
				{$i18n.core.no}
			</button>

			<button type="button" onclick={stopPropagation(deleteCustomDomain)} disabled={$isBusy}>
				{$i18n.core.yes}
			</button>
		</div>

		{#if advancedOptions}
			<hr />
			<Checkbox>
				<input type="checkbox" onchange={() => (skipDeleteDomain = !skipDeleteDomain)} />
				<span class="skip-delete">{$i18n.hosting.skip_delete_domain}</span>
			</Checkbox>
		{/if}
	</div>
</Popover>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x);

		h3,
		p {
			white-space: initial;
			word-break: break-word;
		}
	}

	.tools {
		display: flex;
		gap: var(--padding);
	}

	.toolbar {
		display: flex;
		gap: var(--padding-2x);
	}

	p {
		padding: 0 0 var(--padding-2x);
	}

	.skip-delete {
		white-space: pre-wrap;
	}

	.warning {
		color: var(--color-warning);
	}
</style>
